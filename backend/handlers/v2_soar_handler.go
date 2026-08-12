package handlers

import (
	"net/http"

	"netsentinel-x-backend/models/events"
	"netsentinel-x-backend/services"
	"netsentinel-x-backend/soar"

	"github.com/gin-gonic/gin"
)

type V2SOARHandler struct {
	soarEngine *soar.SOAREngine
	auditSvc   *services.SOARAuditService
}

func NewV2SOARHandler() *V2SOARHandler {
	return &V2SOARHandler{
		soarEngine: soar.GetSOAREngine(),
		auditSvc:   services.GetSOARAuditService(),
	}
}

// GetPlaybooks handles GET /api/v2/soar/playbooks
func (h *V2SOARHandler) GetPlaybooks(c *gin.Context) {
	playbooks := h.soarEngine.GetPlaybookEngine().GetPlaybooks()
	c.JSON(http.StatusOK, gin.H{
		"playbooks": playbooks,
		"total":     len(playbooks),
	})
}

// ExecutePlaybook handles POST /api/v2/soar/playbooks/:id/execute
func (h *V2SOARHandler) ExecutePlaybook(c *gin.Context) {
	pbID := c.Param("id")
	eventID := events.GenerateUUID()

	exec, err := h.soarEngine.ExecutePlaybook(c.Request.Context(), pbID, eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, exec)
}

// GetExecutions handles GET /api/v2/soar/executions
func (h *V2SOARHandler) GetExecutions(c *gin.Context) {
	executions := h.soarEngine.GetExecutions()
	c.JSON(http.StatusOK, gin.H{
		"executions": executions,
		"total":      len(executions),
	})
}

// GetApprovals handles GET /api/v2/soar/approvals
func (h *V2SOARHandler) GetApprovals(c *gin.Context) {
	pending := h.soarEngine.GetApprovalManager().GetPendingApprovals()
	c.JSON(http.StatusOK, gin.H{
		"approvals": pending,
		"total":     len(pending),
	})
}

// ApproveAction handles POST /api/v2/soar/actions/:id/approve
func (h *V2SOARHandler) ApproveAction(c *gin.Context) {
	id := c.Param("id")
	req, ok := h.soarEngine.GetApprovalManager().DecideApproval(id, true, "SOC Lead Analyst")
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "approval request not found or already processed"})
		return
	}

	h.auditSvc.RecordAction(
		req.ExecutionID,
		req.PlaybookName,
		req.ActionType,
		req.Target,
		"SOC_LEAD_ANALYST",
		"Manual approval granted via SOAR Approval Queue",
		"APPROVED",
		"SOC Lead Analyst",
		req.DecidedAt,
	)

	c.JSON(http.StatusOK, gin.H{
		"message":  "Approval granted successfully",
		"approval": req,
	})
}

// RejectAction handles POST /api/v2/soar/actions/:id/reject
func (h *V2SOARHandler) RejectAction(c *gin.Context) {
	id := c.Param("id")
	req, ok := h.soarEngine.GetApprovalManager().DecideApproval(id, false, "SOC Lead Analyst")
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "approval request not found or already processed"})
		return
	}

	h.auditSvc.RecordAction(
		req.ExecutionID,
		req.PlaybookName,
		req.ActionType,
		req.Target,
		"SOC_LEAD_ANALYST",
		"Manual approval rejected by SOC analyst",
		"REJECTED",
		"SOC Lead Analyst",
		req.DecidedAt,
	)

	c.JSON(http.StatusOK, gin.H{
		"message":  "Approval rejected",
		"approval": req,
	})
}

// GetAuditLogs handles GET /api/v2/soar/audit
func (h *V2SOARHandler) GetAuditLogs(c *gin.Context) {
	logs := h.auditSvc.GetAuditLogs(50)
	c.JSON(http.StatusOK, gin.H{
		"audit_logs": logs,
		"total":      len(logs),
	})
}
