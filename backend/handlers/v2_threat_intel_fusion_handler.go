package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"
)

// V2ThreatIntelFusionHandler handles REST endpoints for Era 35 Threat Intelligence Fusion.
type V2ThreatIntelFusionHandler struct {
	intelService *services.ThreatIntelFusionEngineService
}

func NewV2ThreatIntelFusionHandler(service *services.ThreatIntelFusionEngineService) *V2ThreatIntelFusionHandler {
	return &V2ThreatIntelFusionHandler{intelService: service}
}

// ListFeeds handles GET /api/v2/threat-intel/feeds
func (h *V2ThreatIntelFusionHandler) ListFeeds(c *gin.Context) {
	feeds := h.intelService.ListFeeds()
	c.JSON(http.StatusOK, gin.H{"success": true, "data": feeds})
}

// SyncFeed handles POST /api/v2/threat-intel/feeds/:id/sync
func (h *V2ThreatIntelFusionHandler) SyncFeed(c *gin.Context) {
	id := c.Param("id")
	synced, err := h.intelService.SyncFeed(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": synced})
}

// GetIOCs handles GET /api/v2/threat-intel/iocs
func (h *V2ThreatIntelFusionHandler) GetIOCs(c *gin.Context) {
	iocs := h.intelService.GetNormalizedIOCs()
	c.JSON(http.StatusOK, gin.H{"success": true, "data": iocs})
}

// EnrichIOC handles POST /api/v2/threat-intel/enrich
func (h *V2ThreatIntelFusionHandler) EnrichIOC(c *gin.Context) {
	var req models.IOCEnrichmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, err := h.intelService.EnrichIOC(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": res})
}

// GetHealth handles GET /api/v2/threat-intel/health
func (h *V2ThreatIntelFusionHandler) GetHealth(c *gin.Context) {
	health := h.intelService.GetFeedHealthMetrics()
	c.JSON(http.StatusOK, gin.H{"success": true, "data": health})
}
