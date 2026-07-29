package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

// V2InfrastructureHandler handles Era 21 Infrastructure Security API endpoints.
type V2InfrastructureHandler struct {
	infraService *services.InfrastructureSecurityService
}

// NewV2InfrastructureHandler creates a new infrastructure security handler.
func NewV2InfrastructureHandler(infraService *services.InfrastructureSecurityService) *V2InfrastructureHandler {
	return &V2InfrastructureHandler{infraService: infraService}
}

// GetInfraPosture returns the full infrastructure security posture.
// GET /api/v2/infra/posture
func (h *V2InfrastructureHandler) GetInfraPosture(c *gin.Context) {
	posture := h.infraService.GetPosture()
	c.JSON(http.StatusOK, gin.H{
		"posture": posture,
		"era":     "21",
		"layer":   "Infrastructure & Platform Security",
	})
}

// GetHardeningChecks returns detailed server hardening check results.
// GET /api/v2/infra/hardening
func (h *V2InfrastructureHandler) GetHardeningChecks(c *gin.Context) {
	posture := h.infraService.GetPosture()
	c.JSON(http.StatusOK, gin.H{
		"checks":          posture.HardeningChecks,
		"passed":          posture.PassedChecks,
		"warnings":        posture.WarningIssues,
		"critical_issues": posture.CriticalIssues,
		"total":           posture.TotalChecks,
	})
}

// GetDockerSecurity returns Docker container security check results.
// GET /api/v2/infra/docker
func (h *V2InfrastructureHandler) GetDockerSecurity(c *gin.Context) {
	posture := h.infraService.GetPosture()
	c.JSON(http.StatusOK, gin.H{
		"docker_checks": posture.DockerChecks,
		"score":         posture.Domains[1].Score,
		"status":        posture.Domains[1].Status,
	})
}

// GetNetworkSegmentation returns the network segmentation security model.
// GET /api/v2/infra/network
func (h *V2InfrastructureHandler) GetNetworkSegmentation(c *gin.Context) {
	posture := h.infraService.GetPosture()
	c.JSON(http.StatusOK, gin.H{
		"network_controls": posture.NetworkControls,
		"score":            posture.Domains[2].Score,
		"status":           posture.Domains[2].Status,
	})
}

// GetTLSControls returns TLS and cryptographic control compliance status.
// GET /api/v2/infra/tls
func (h *V2InfrastructureHandler) GetTLSControls(c *gin.Context) {
	posture := h.infraService.GetPosture()
	c.JSON(http.StatusOK, gin.H{
		"tls_controls": posture.TLSControls,
		"score":        posture.Domains[3].Score,
		"status":       posture.Domains[3].Status,
	})
}
