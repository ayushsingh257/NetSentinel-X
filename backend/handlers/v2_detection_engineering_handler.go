package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"
)

// V2DetectionEngineeringHandler exposes REST API endpoints for Era 34 Advanced Detection Engine.
type V2DetectionEngineeringHandler struct {
	detectionService *services.AdvancedDetectionService
}

func NewV2DetectionEngineeringHandler(service *services.AdvancedDetectionService) *V2DetectionEngineeringHandler {
	return &V2DetectionEngineeringHandler{detectionService: service}
}

// ListRules handles GET /api/v2/detection/rules
func (h *V2DetectionEngineeringHandler) ListRules(c *gin.Context) {
	rules := h.detectionService.ListRules()
	c.JSON(http.StatusOK, gin.H{"success": true, "data": rules})
}

// GetRule handles GET /api/v2/detection/rules/:id
func (h *V2DetectionEngineeringHandler) GetRule(c *gin.Context) {
	id := c.Param("id")
	rule, err := h.detectionService.GetRuleByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": rule})
}

// CreateRule handles POST /api/v2/detection/rules
func (h *V2DetectionEngineeringHandler) CreateRule(c *gin.Context) {
	var rule models.AdvancedDetectionRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	created, err := h.detectionService.CreateRule(rule)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": created})
}

// UpdateRule handles PUT /api/v2/detection/rules/:id
func (h *V2DetectionEngineeringHandler) UpdateRule(c *gin.Context) {
	id := c.Param("id")
	var rule models.AdvancedDetectionRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updated, err := h.detectionService.UpdateRule(id, rule)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": updated})
}

// DeleteRule handles DELETE /api/v2/detection/rules/:id
func (h *V2DetectionEngineeringHandler) DeleteRule(c *gin.Context) {
	id := c.Param("id")
	if err := h.detectionService.DeleteRule(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Detection rule deleted successfully"})
}

// TestRule handles POST /api/v2/detection/test
func (h *V2DetectionEngineeringHandler) TestRule(c *gin.Context) {
	var req models.RuleTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := h.detectionService.TestRule(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// SimulateRule handles POST /api/v2/detection/simulate
func (h *V2DetectionEngineeringHandler) SimulateRule(c *gin.Context) {
	var req models.RuleSimulationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := h.detectionService.SimulateRule(req)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetMetrics handles GET /api/v2/detection/metrics
func (h *V2DetectionEngineeringHandler) GetMetrics(c *gin.Context) {
	metrics := h.detectionService.GetDetectionMetrics()
	c.JSON(http.StatusOK, gin.H{"success": true, "data": metrics})
}
