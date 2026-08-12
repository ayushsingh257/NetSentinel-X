package handlers

import (
	"net/http"
	"strconv"

	"netsentinel-x-backend/ai"
	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2AIIntelligenceHandler struct {
	aiEngine         *ai.AIEngine
	investigationSvc *services.InvestigationAIService
	mitreSvc         *services.MITREService
	storage          *services.AIPersistenceService
}

func NewV2AIIntelligenceHandler() *V2AIIntelligenceHandler {
	return &V2AIIntelligenceHandler{
		aiEngine:         ai.NewAIEngine(ai.NewDeterministicMockProvider()),
		investigationSvc: services.NewInvestigationAIService(),
		mitreSvc:         services.NewMITREService(),
		storage:          services.GetAIPersistenceService(),
	}
}

// GetInvestigation handles GET /api/v2/ai/investigation/:incident_id
func (h *V2AIIntelligenceHandler) GetInvestigation(c *gin.Context) {
	incidentID := c.Param("incident_id")
	details := h.investigationSvc.GenerateInvestigation(incidentID)
	c.JSON(http.StatusOK, details)
}

// GetThreatMITRE handles GET /api/v2/threats/:id/mitre
func (h *V2AIIntelligenceHandler) GetThreatMITRE(c *gin.Context) {
	threatID := c.Param("id")
	mapping := h.mitreSvc.GetThreatMITREMapping(threatID)
	c.JSON(http.StatusOK, mapping)
}

// GetLatestAnalysis handles GET /api/v2/ai/analysis/latest
func (h *V2AIIntelligenceHandler) GetLatestAnalysis(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	limit, _ := strconv.Atoi(limitStr)
	results := h.storage.GetLatestAnalysisResults(limit)
	c.JSON(http.StatusOK, gin.H{
		"results": results,
		"total":   len(results),
	})
}

// CopilotChat handles POST /api/v2/ai/copilot/chat
func (h *V2AIIntelligenceHandler) CopilotChat(c *gin.Context) {
	var body struct {
		Prompt string                 `json:"prompt" binding:"required"`
		Data   map[string]interface{} `json:"data"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "prompt is required"})
		return
	}

	resp, err := h.aiEngine.QueryCopilot(c.Request.Context(), body.Prompt, body.Data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}
