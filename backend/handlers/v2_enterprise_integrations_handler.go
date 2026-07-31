package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"
)

// V2EnterpriseIntegrationsHandler handles REST API calls for Era 36 Enterprise Integrations.
type V2EnterpriseIntegrationsHandler struct {
	integrationService *services.EnterpriseIntegrationsService
}

func NewV2EnterpriseIntegrationsHandler(service *services.EnterpriseIntegrationsService) *V2EnterpriseIntegrationsHandler {
	return &V2EnterpriseIntegrationsHandler{integrationService: service}
}

// ListTargets handles GET /api/v2/integrations/targets
func (h *V2EnterpriseIntegrationsHandler) ListTargets(c *gin.Context) {
	targets := h.integrationService.ListIntegrations()
	c.JSON(http.StatusOK, gin.H{"success": true, "data": targets})
}

// GetTarget handles GET /api/v2/integrations/targets/:id
func (h *V2EnterpriseIntegrationsHandler) GetTarget(c *gin.Context) {
	id := c.Param("id")
	target, err := h.integrationService.GetIntegrationByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": target})
}

// CreateTarget handles POST /api/v2/integrations/targets
func (h *V2EnterpriseIntegrationsHandler) CreateTarget(c *gin.Context) {
	var target models.IntegrationTarget
	if err := c.ShouldBindJSON(&target); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	created, err := h.integrationService.CreateIntegration(target)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": created})
}

// UpdateTarget handles PUT /api/v2/integrations/targets/:id
func (h *V2EnterpriseIntegrationsHandler) UpdateTarget(c *gin.Context) {
	id := c.Param("id")
	var target models.IntegrationTarget
	if err := c.ShouldBindJSON(&target); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updated, err := h.integrationService.UpdateIntegration(id, target)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": updated})
}

// DeleteTarget handles DELETE /api/v2/integrations/targets/:id
func (h *V2EnterpriseIntegrationsHandler) DeleteTarget(c *gin.Context) {
	id := c.Param("id")
	if err := h.integrationService.DeleteIntegration(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Integration target deleted successfully"})
}

// TestTarget handles POST /api/v2/integrations/test
func (h *V2EnterpriseIntegrationsHandler) TestTarget(c *gin.Context) {
	var req models.IntegrationTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, err := h.integrationService.TestIntegration(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": res})
}

// GetPipelines handles GET /api/v2/integrations/pipelines
func (h *V2EnterpriseIntegrationsHandler) GetPipelines(c *gin.Context) {
	pipelines := h.integrationService.GetExportPipelines()
	c.JSON(http.StatusOK, gin.H{"success": true, "data": pipelines})
}

// GetMetrics handles GET /api/v2/integrations/metrics
func (h *V2EnterpriseIntegrationsHandler) GetMetrics(c *gin.Context) {
	metrics := h.integrationService.GetIntegrationMetrics()
	c.JSON(http.StatusOK, gin.H{"success": true, "data": metrics})
}
