package handlers

import (
	"net/http"

	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2DetectionHandler struct {
	detectionService *services.DetectionEngineService
}

func NewV2DetectionHandler() *V2DetectionHandler {
	return &V2DetectionHandler{
		detectionService: services.NewDetectionEngineService(),
	}
}

type AIAssistantReq struct {
	Query string `json:"query"`
}

func (h *V2DetectionHandler) GetRules(c *gin.Context) {
	rules := h.detectionService.GetAllRules()
	c.JSON(http.StatusOK, gin.H{
		"rules": rules,
		"total": len(rules),
	})
}

func (h *V2DetectionHandler) CreateRule(c *gin.Context) {
	var rule models.DetectionRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid rule JSON format",
		})
		return
	}

	created := h.detectionService.CreateRule(rule)
	c.JSON(http.StatusCreated, created)
}

func (h *V2DetectionHandler) GetRuleByID(c *gin.Context) {
	id := c.Param("id")
	rule, exists := h.detectionService.GetRuleByID(id)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Detection rule not found",
		})
		return
	}

	c.JSON(http.StatusOK, rule)
}

func (h *V2DetectionHandler) UpdateRule(c *gin.Context) {
	id := c.Param("id")
	var rule models.DetectionRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid rule JSON payload",
		})
		return
	}

	updated, exists := h.detectionService.UpdateRule(id, rule)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Rule not found",
		})
		return
	}

	c.JSON(http.StatusOK, updated)
}

func (h *V2DetectionHandler) DeleteRule(c *gin.Context) {
	id := c.Param("id")
	success := h.detectionService.DeleteRule(id)
	if !success {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Rule not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Detection rule deleted successfully",
		"id":      id,
	})
}

func (h *V2DetectionHandler) ToggleRule(c *gin.Context) {
	id := c.Param("id")
	rule, exists := h.detectionService.ToggleRuleStatus(id)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Rule not found",
		})
		return
	}

	c.JSON(http.StatusOK, rule)
}

func (h *V2DetectionHandler) TestRule(c *gin.Context) {
	var req models.SimulationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid simulation request body",
		})
		return
	}

	res := h.detectionService.RunSimulation(req)
	c.JSON(http.StatusOK, res)
}

func (h *V2DetectionHandler) Simulate(c *gin.Context) {
	var req models.SimulationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid simulation request payload",
		})
		return
	}

	res := h.detectionService.RunSimulation(req)
	c.JSON(http.StatusOK, res)
}

func (h *V2DetectionHandler) GetAnalytics(c *gin.Context) {
	analytics := h.detectionService.GetAnalytics()
	c.JSON(http.StatusOK, analytics)
}

func (h *V2DetectionHandler) AIAssistant(c *gin.Context) {
	var req AIAssistantReq
	if err := c.ShouldBindJSON(&req); err != nil || req.Query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "query parameter is required",
		})
		return
	}

	resp := h.detectionService.AIDetectionAssistant(req.Query)
	c.JSON(http.StatusOK, gin.H{
		"query":          req.Query,
		"recommendation": resp,
	})
}
