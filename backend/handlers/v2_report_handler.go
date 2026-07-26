package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2ReportHandler struct {
	reportService *services.ReportService
}

func NewV2ReportHandler() *V2ReportHandler {
	return &V2ReportHandler{
		reportService: services.NewReportService(),
	}
}

type GenerateReportReq struct {
	Type  string `json:"type"`
	Title string `json:"title"`
}

func (h *V2ReportHandler) GetReports(c *gin.Context) {
	reports := h.reportService.GetReports()
	c.JSON(http.StatusOK, gin.H{
		"reports": reports,
		"total":   len(reports),
	})
}

func (h *V2ReportHandler) GenerateReport(c *gin.Context) {
	var req GenerateReportReq
	if err := c.ShouldBindJSON(&req); err != nil || req.Type == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "type parameter is required",
		})
		return
	}

	if req.Title == "" {
		req.Title = "Generated Security Report"
	}

	rep := h.reportService.GenerateReport(req.Type, req.Title)
	c.JSON(http.StatusCreated, rep)
}

func (h *V2ReportHandler) ExportReport(c *gin.Context) {
	id := c.Param("id")
	html := h.reportService.ExportReportHTML(id)
	c.Header("Content-Type", "text/html")
	c.String(http.StatusOK, html)
}

func (h *V2ReportHandler) GetCompliance(c *gin.Context) {
	fwMap := h.reportService.GetComplianceFrameworks()
	c.JSON(http.StatusOK, gin.H{
		"frameworks": fwMap,
	})
}

func (h *V2ReportHandler) GetComplianceStatus(c *gin.Context) {
	fwMap := h.reportService.GetComplianceFrameworks()
	c.JSON(http.StatusOK, gin.H{
		"overall_status":    "COMPLIANT",
		"passed_frameworks": 3,
		"frameworks":        fwMap,
	})
}
