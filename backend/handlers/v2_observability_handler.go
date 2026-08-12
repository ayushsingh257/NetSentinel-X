package handlers

import (
	"net/http"
	"strconv"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2ObservabilityHandler struct {
	auditService  *services.AuditService
	healthService *services.HealthMonitorService
}

func NewV2ObservabilityHandler() *V2ObservabilityHandler {
	return &V2ObservabilityHandler{
		auditService:  services.NewAuditService(),
		healthService: services.NewHealthMonitorService(),
	}
}

func (h *V2ObservabilityHandler) GetAuditLogs(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "100")
	limit, _ := strconv.Atoi(limitStr)
	logs := h.auditService.GetLogs(limit)
	c.JSON(http.StatusOK, gin.H{
		"logs":  logs,
		"total": len(logs),
	})
}

func (h *V2ObservabilityHandler) SearchAuditLogs(c *gin.Context) {
	q := c.Query("q")
	category := c.Query("category")
	severity := c.Query("severity")
	user := c.Query("user")

	results := h.auditService.SearchLogs(q, category, severity, user)
	c.JSON(http.StatusOK, gin.H{
		"logs":  results,
		"total": len(results),
	})
}

func (h *V2ObservabilityHandler) ExportAuditLogs(c *gin.Context) {
	csvData := h.auditService.ExportLogs()
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=netsentinel_audit_logs.csv")
	c.String(http.StatusOK, csvData)
}

func (h *V2ObservabilityHandler) GetHealth(c *gin.Context) {
	health := h.healthService.GetPlatformHealth()
	c.JSON(http.StatusOK, health)
}

func (h *V2ObservabilityHandler) GetHealthServices(c *gin.Context) {
	servicesList := h.healthService.GetServices()
	c.JSON(http.StatusOK, gin.H{
		"services": servicesList,
		"total":    len(servicesList),
	})
}

func (h *V2ObservabilityHandler) GetMetrics(c *gin.Context) {
	metrics := h.healthService.GetMetrics()
	c.JSON(http.StatusOK, metrics)
}

func (h *V2ObservabilityHandler) GetSecurityMetrics(c *gin.Context) {
	metrics := h.healthService.GetMetrics()
	c.JSON(http.StatusOK, metrics.Security)
}

// GetSystemHealth handles GET /api/v2/system/health returning complete infrastructure runtime metrics.
func (h *V2ObservabilityHandler) GetSystemHealth(c *gin.Context) {
	details := h.healthService.GetSystemHealthDetails()
	c.JSON(http.StatusOK, details)
}
