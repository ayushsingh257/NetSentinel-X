package handlers

import (
	"net/http"

	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2IntelligenceHandler struct {
	intelService *services.ThreatIntelligenceFusionService
}

func NewV2IntelligenceHandler() *V2IntelligenceHandler {
	return &V2IntelligenceHandler{
		intelService: services.NewThreatIntelligenceFusionService(),
	}
}

func (h *V2IntelligenceHandler) GetOverview(c *gin.Context) {
	overview := h.intelService.GetOverview()
	c.JSON(http.StatusOK, overview)
}

func (h *V2IntelligenceHandler) LookupIP(c *gin.Context) {
	ip := c.Param("value")
	if ip == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "IP address parameter is required",
		})
		return
	}

	record, found := h.intelService.LookupIOC(ip)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "IP threat intelligence record not found",
		})
		return
	}

	c.JSON(http.StatusOK, record)
}

func (h *V2IntelligenceHandler) LookupDomain(c *gin.Context) {
	domain := c.Param("value")
	if domain == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Domain parameter is required",
		})
		return
	}

	record, found := h.intelService.LookupIOC(domain)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Domain threat intelligence record not found",
		})
		return
	}

	c.JSON(http.StatusOK, record)
}

func (h *V2IntelligenceHandler) LookupIOC(c *gin.Context) {
	val := c.Param("value")
	if val == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "IOC parameter is required",
		})
		return
	}

	record, found := h.intelService.LookupIOC(val)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "IOC record not found",
		})
		return
	}

	c.JSON(http.StatusOK, record)
}

func (h *V2IntelligenceHandler) EnrichIOC(c *gin.Context) {
	var req models.EnrichmentRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.IOCValue == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid enrichment request body",
		})
		return
	}

	record := h.intelService.EnrichIOC(req.IOCValue)
	c.JSON(http.StatusOK, record)
}

func (h *V2IntelligenceHandler) GetHistory(c *gin.Context) {
	history := h.intelService.GetHistory()
	c.JSON(http.StatusOK, gin.H{
		"history": history,
		"total":   len(history),
	})
}
