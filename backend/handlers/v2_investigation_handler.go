package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2InvestigationHandler struct {
	investigationService *services.ThreatInvestigationService
}

func NewV2InvestigationHandler() *V2InvestigationHandler {
	return &V2InvestigationHandler{
		investigationService: services.NewThreatInvestigationService(),
	}
}

type GenerateInvestigationReq struct {
	TargetIP string `json:"target_ip"`
	AlertID  string `json:"alert_id,omitempty"`
}

func (h *V2InvestigationHandler) GetInvestigations(c *gin.Context) {
	investigations := h.investigationService.GetAllInvestigations()
	c.JSON(http.StatusOK, gin.H{
		"investigations": investigations,
		"total":          len(investigations),
	})
}

func (h *V2InvestigationHandler) GetInvestigationByID(c *gin.Context) {
	id := c.Param("id")
	inv, exists := h.investigationService.GetInvestigationByID(id)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Investigation not found",
		})
		return
	}

	c.JSON(http.StatusOK, inv)
}

func (h *V2InvestigationHandler) GenerateInvestigation(c *gin.Context) {
	var req GenerateInvestigationReq
	_ = c.ShouldBindJSON(&req)

	inv, err := h.investigationService.GenerateInvestigation(req.TargetIP, req.AlertID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate AI threat investigation",
		})
		return
	}

	c.JSON(http.StatusCreated, inv)
}
