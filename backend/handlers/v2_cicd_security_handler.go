package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

// V2CICDSecurityHandler handles Era 26 CI/CD Security & SSDLC REST API endpoints.
type V2CICDSecurityHandler struct {
	cicdService *services.CICDSecurityService
}

// NewV2CICDSecurityHandler creates a new V2CICDSecurityHandler instance.
func NewV2CICDSecurityHandler(cicdService *services.CICDSecurityService) *V2CICDSecurityHandler {
	return &V2CICDSecurityHandler{
		cicdService: cicdService,
	}
}

// GetPosture returns overall CI/CD SSDLC pipeline posture score (98/100) and gate status.
// GET /api/v2/cicd-security/posture
func (h *V2CICDSecurityHandler) GetPosture(c *gin.Context) {
	posture := h.cicdService.GetPosture()
	c.JSON(http.StatusOK, gin.H{
		"posture": posture,
		"era":     "26",
		"layer":   "CI/CD Security & Secure Software Development Lifecycle (SSDLC)",
	})
}

// GetScans returns overall security gate scan statuses (SAST, Secrets, Dependencies, Container, SBOM).
// GET /api/v2/cicd-security/scans
func (h *V2CICDSecurityHandler) GetScans(c *gin.Context) {
	posture := h.cicdService.GetPosture()
	c.JSON(http.StatusOK, gin.H{
		"sast_status":            posture.SASTStatus,
		"secret_scan_status":     posture.SecretScanStatus,
		"dependency_scan_status": posture.DependencyScanStatus,
		"container_scan_status":  posture.ContainerScanStatus,
		"sbom_status":            posture.SBOMStatus,
		"last_pipeline_run":      posture.LastPipelineRun,
		"gate_outcome":           posture.GateOutcome,
	})
}

// GetVulnerabilities returns detailed SAST findings, secret scan results, package CVEs, and container findings.
// GET /api/v2/cicd-security/vulnerabilities
func (h *V2CICDSecurityHandler) GetVulnerabilities(c *gin.Context) {
	sast := h.cicdService.GetSASTFindings()
	secrets := h.cicdService.GetSecretScanFindings()
	deps := h.cicdService.GetDependencyFindings()
	containers := h.cicdService.GetContainerFindings()

	c.JSON(http.StatusOK, gin.H{
		"sast_findings":       sast,
		"secret_findings":     secrets,
		"dependency_findings": deps,
		"container_findings":  containers,
		"total_findings":      len(sast) + len(secrets) + len(deps) + len(containers),
	})
}

// GetSBOM returns Software Bill of Materials component inventory.
// GET /api/v2/cicd-security/sbom
func (h *V2CICDSecurityHandler) GetSBOM(c *gin.Context) {
	components := h.cicdService.GetSBOM()
	c.JSON(http.StatusOK, gin.H{
		"sbom":      components,
		"total":     len(components),
		"spec":      "SPDX-2.3 / CycloneDX",
		"generated": "Syft Automated Generator",
	})
}
