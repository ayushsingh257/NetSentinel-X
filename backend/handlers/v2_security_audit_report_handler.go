package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"netsentinel-x-backend/services"
)

// V2SecurityAuditReportHandler exposes REST API endpoints for Era 31 DevSecOps Security Audit & Zero Trust reporting.
type V2SecurityAuditReportHandler struct {
	auditReportService *services.SecurityAuditReportService
}

// NewV2SecurityAuditReportHandler initializes V2SecurityAuditReportHandler.
func NewV2SecurityAuditReportHandler(reportService *services.SecurityAuditReportService) *V2SecurityAuditReportHandler {
	return &V2SecurityAuditReportHandler{
		auditReportService: reportService,
	}
}

// GetReport handles GET /api/v2/security-audit/report
func (h *V2SecurityAuditReportHandler) GetReport(c *gin.Context) {
	report := h.auditReportService.GetReport()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    report,
	})
}

// RunAudit handles POST /api/v2/security-audit/run
func (h *V2SecurityAuditReportHandler) RunAudit(c *gin.Context) {
	report, status := h.auditReportService.RunAudit()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"status":  status,
		"data":    report,
	})
}
