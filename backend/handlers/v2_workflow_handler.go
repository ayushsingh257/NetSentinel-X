package handlers

import (
	"net/http"

	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2WorkflowHandler struct {
	wfService *services.WorkflowService
}

func NewV2WorkflowHandler() *V2WorkflowHandler {
	return &V2WorkflowHandler{
		wfService: services.NewWorkflowService(),
	}
}

type ExecuteWorkflowReq struct {
	WorkflowID string `json:"workflow_id"`
}

type DecideApprovalReq struct {
	ApprovalID string `json:"approval_id"`
	Approved   bool   `json:"approved"`
}

type GeneratePlaybookReq struct {
	Category string `json:"category"`
}

func (h *V2WorkflowHandler) GetWorkflows(c *gin.Context) {
	workflows := h.wfService.GetWorkflows()
	c.JSON(http.StatusOK, gin.H{
		"workflows": workflows,
		"total":     len(workflows),
	})
}

func (h *V2WorkflowHandler) CreateWorkflow(c *gin.Context) {
	var wf models.Workflow
	if err := c.ShouldBindJSON(&wf); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	created := h.wfService.CreateWorkflow(wf)
	c.JSON(http.StatusCreated, created)
}

func (h *V2WorkflowHandler) GetTemplates(c *gin.Context) {
	templates := h.wfService.GetTemplates()
	c.JSON(http.StatusOK, gin.H{
		"templates": templates,
		"total":     len(templates),
	})
}

func (h *V2WorkflowHandler) ExecuteWorkflow(c *gin.Context) {
	var req ExecuteWorkflowReq
	if err := c.ShouldBindJSON(&req); err != nil || req.WorkflowID == "" {
		req.WorkflowID = "WF-001"
	}
	exec, err := h.wfService.ExecuteWorkflow(req.WorkflowID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, exec)
}

func (h *V2WorkflowHandler) GetHistory(c *gin.Context) {
	history := h.wfService.GetExecutionHistory()
	c.JSON(http.StatusOK, gin.H{
		"executions": history,
		"total":      len(history),
	})
}

func (h *V2WorkflowHandler) GetExecutionStatus(c *gin.Context) {
	id := c.Param("id")
	exec, exists := h.wfService.GetExecutionByID(id)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Execution not found", "id": id})
		return
	}
	c.JSON(http.StatusOK, exec)
}

func (h *V2WorkflowHandler) GetApprovals(c *gin.Context) {
	approvals := h.wfService.GetApprovals()
	c.JSON(http.StatusOK, gin.H{
		"approvals": approvals,
		"total":     len(approvals),
	})
}

func (h *V2WorkflowHandler) DecideApproval(c *gin.Context) {
	var req DecideApprovalReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	app, ok := h.wfService.DecideApproval(req.ApprovalID, req.Approved)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Approval not found"})
		return
	}
	c.JSON(http.StatusOK, app)
}

func (h *V2WorkflowHandler) GeneratePlaybook(c *gin.Context) {
	var req GeneratePlaybookReq
	if err := c.ShouldBindJSON(&req); err != nil || req.Category == "" {
		req.Category = "C2_BEACONING"
	}
	pb := h.wfService.GenerateAIPlaybook(req.Category)
	c.JSON(http.StatusOK, pb)
}
