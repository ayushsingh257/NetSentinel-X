package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"
)

// V2AIAnalystHandler handles REST API calls for Era 33 AI Security Analyst capabilities.
type V2AIAnalystHandler struct {
	analystService *services.AISecurityAnalystService
}

func NewV2AIAnalystHandler(service *services.AISecurityAnalystService) *V2AIAnalystHandler {
	return &V2AIAnalystHandler{analystService: service}
}

// ExplainAlert handles POST /api/v2/ai-analyst/explain-alert
func (h *V2AIAnalystHandler) ExplainAlert(c *gin.Context) {
	var req models.ExplainAlertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.analystService.ExplainAlert(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

// SummarizeThreat handles POST /api/v2/ai-analyst/summarize-threat
func (h *V2AIAnalystHandler) SummarizeThreat(c *gin.Context) {
	var req models.SummarizeThreatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.analystService.SummarizeThreat(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

// SummarizeIncident handles POST /api/v2/ai-analyst/summarize-incident
func (h *V2AIAnalystHandler) SummarizeIncident(c *gin.Context) {
	var req models.SummarizeIncidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.analystService.SummarizeIncident(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

// ExplainTimeline handles POST /api/v2/ai-analyst/explain-timeline
func (h *V2AIAnalystHandler) ExplainTimeline(c *gin.Context) {
	var req models.ExplainTimelineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.analystService.ExplainTimeline(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

// ExplainIOC handles POST /api/v2/ai-analyst/explain-ioc
func (h *V2AIAnalystHandler) ExplainIOC(c *gin.Context) {
	var req models.ExplainIOCRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.analystService.ExplainIOC(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

// ExplainMITRE handles POST /api/v2/ai-analyst/explain-mitre
func (h *V2AIAnalystHandler) ExplainMITRE(c *gin.Context) {
	var req models.ExplainMITRERequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.analystService.ExplainMITRE(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

// ThreatHuntingQuery handles POST /api/v2/ai-analyst/threat-hunting-query
func (h *V2AIAnalystHandler) ThreatHuntingQuery(c *gin.Context) {
	var req models.ThreatHuntingQueryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.analystService.ThreatHuntingQuery(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

// InvestigateAssistance handles POST /api/v2/ai-analyst/investigate-assistance
func (h *V2AIAnalystHandler) InvestigateAssistance(c *gin.Context) {
	var req models.InvestigationAssistanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.analystService.InvestigateAssistance(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}
