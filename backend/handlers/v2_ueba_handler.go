package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2UEBAHandler struct {
	uebaService *services.UEBAService
}

func NewV2UEBAHandler() *V2UEBAHandler {
	return &V2UEBAHandler{
		uebaService: services.NewUEBAService(),
	}
}

func (h *V2UEBAHandler) GetOverview(c *gin.Context) {
	overview := h.uebaService.GetOverview()
	c.JSON(http.StatusOK, overview)
}

func (h *V2UEBAHandler) GetEntities(c *gin.Context) {
	entities := h.uebaService.GetEntities()
	c.JSON(http.StatusOK, gin.H{
		"entities": entities,
		"total":    len(entities),
	})
}

func (h *V2UEBAHandler) GetAnomalies(c *gin.Context) {
	anomalies := h.uebaService.GetAnomalies()
	c.JSON(http.StatusOK, gin.H{
		"anomalies": anomalies,
		"total":     len(anomalies),
	})
}

func (h *V2UEBAHandler) GetEntityRisk(c *gin.Context) {
	entityVal := c.Param("entity")
	if entityVal == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "entity parameter is required",
		})
		return
	}

	profile, anomalies, found := h.uebaService.GetEntityRiskProfile(entityVal)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Entity risk profile not found",
		})
		return
	}

	aiExplanation := h.uebaService.AIBehaviourExplanation(entityVal)

	c.JSON(http.StatusOK, gin.H{
		"profile":        profile,
		"anomalies":      anomalies,
		"ai_explanation": aiExplanation,
	})
}

func (h *V2UEBAHandler) GetHistory(c *gin.Context) {
	anomalies := h.uebaService.GetAnomalies()
	c.JSON(http.StatusOK, gin.H{
		"history": anomalies,
		"total":   len(anomalies),
	})
}
