package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"netsentinel-x-backend/services"
)

// V2SecurityValidationHandler exposes REST endpoints for Era 30 Enterprise Security Validation & Certification.
type V2SecurityValidationHandler struct {
	auditService         *services.SecurityAuditService
	vulnerabilityService *services.VulnerabilityAssessmentService
	owaspService         *services.OWASPValidationService
	simulationService    *services.SecuritySimulationService
	scoreService         *services.SecurityScoreService
}

// NewV2SecurityValidationHandler initializes V2SecurityValidationHandler.
func NewV2SecurityValidationHandler(
	audit *services.SecurityAuditService,
	vuln *services.VulnerabilityAssessmentService,
	owasp *services.OWASPValidationService,
	sim *services.SecuritySimulationService,
	score *services.SecurityScoreService,
) *V2SecurityValidationHandler {
	return &V2SecurityValidationHandler{
		auditService:         audit,
		vulnerabilityService: vuln,
		owaspService:         owasp,
		simulationService:    sim,
		scoreService:         score,
	}
}

// GetStatus handles GET /api/v2/security-validation/status
func (h *V2SecurityValidationHandler) GetStatus(c *gin.Context) {
	score, rating := h.scoreService.CalculateScore()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    score,
		"rating":  rating,
	})
}

// GetAudit handles GET /api/v2/security-validation/audit
func (h *V2SecurityValidationHandler) GetAudit(c *gin.Context) {
	audits, status := h.auditService.ExecuteAudit()
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"status":       status,
		"audit_checks": audits,
		"total":        len(audits),
	})
}

// GetOWASP handles GET /api/v2/security-validation/owasp
func (h *V2SecurityValidationHandler) GetOWASP(c *gin.Context) {
	score, status := h.owaspService.ValidateOWASP()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"status":  status,
		"data":    score,
	})
}

// GetVulnerabilities handles GET /api/v2/security-validation/vulnerabilities
func (h *V2SecurityValidationHandler) GetVulnerabilities(c *gin.Context) {
	report, status := h.vulnerabilityService.AssessVulnerabilities()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"status":  status,
		"data":    report,
	})
}

// RunScan handles POST /api/v2/security-validation/run-scan
func (h *V2SecurityValidationHandler) RunScan(c *gin.Context) {
	audits, _ := h.auditService.ExecuteAudit()
	vulnReport, _ := h.vulnerabilityService.AssessVulnerabilities()
	owaspScore, _ := h.owaspService.ValidateOWASP()
	simulations, _ := h.simulationService.RunSimulations()
	enterpriseScore, rating := h.scoreService.CalculateScore()

	c.JSON(http.StatusOK, gin.H{
		"success":               true,
		"status":                "SCAN_COMPLETE",
		"enterprise_score":      enterpriseScore,
		"rating":                rating,
		"audit_checks_count":    len(audits),
		"vulnerability_summary": vulnReport,
		"owasp_score":           owaspScore.OverallScore,
		"simulations_count":     len(simulations),
	})
}
