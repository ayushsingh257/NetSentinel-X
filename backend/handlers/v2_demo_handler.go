package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2DemoHandler struct {
	demoService *services.DemoScenarioService
}

func NewV2DemoHandler() *V2DemoHandler {
	return &V2DemoHandler{
		demoService: services.NewDemoScenarioService(),
	}
}

type LoadScenarioReq struct {
	ScenarioID string `json:"scenario_id"`
}

func (h *V2DemoHandler) GetScenarios(c *gin.Context) {
	scenarios := h.demoService.GetScenarios()
	c.JSON(http.StatusOK, gin.H{
		"scenarios": scenarios,
		"total":     len(scenarios),
	})
}

func (h *V2DemoHandler) LoadScenario(c *gin.Context) {
	var req LoadScenarioReq
	if err := c.ShouldBindJSON(&req); err != nil || req.ScenarioID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ScenarioID required"})
		return
	}

	result, ok := h.demoService.LoadScenario(req.ScenarioID)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Scenario not found"})
		return
	}

	c.JSON(http.StatusOK, result)
}
