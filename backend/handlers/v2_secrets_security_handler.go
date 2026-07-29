package handlers

import (
	"net/http"

	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

// V2SecretsSecurityHandler handles Era 22 Secrets Security & Cryptography REST endpoints.
type V2SecretsSecurityHandler struct {
	secretsService *services.SecretsManagementService
	cryptoService  *services.CryptographicSecurityService
	leakService    *services.SecretDetectionService
	envService     *services.EnvironmentSecurityService
}

// NewV2SecretsSecurityHandler creates a new V2SecretsSecurityHandler instance.
func NewV2SecretsSecurityHandler(
	secretsService *services.SecretsManagementService,
	cryptoService *services.CryptographicSecurityService,
	leakService *services.SecretDetectionService,
	envService *services.EnvironmentSecurityService,
) *V2SecretsSecurityHandler {
	return &V2SecretsSecurityHandler{
		secretsService: secretsService,
		cryptoService:  cryptoService,
		leakService:    leakService,
		envService:     envService,
	}
}

// GetSecretsPosture returns the overall secrets posture report.
// GET /api/v2/secrets/posture
func (h *V2SecretsSecurityHandler) GetSecretsPosture(c *gin.Context) {
	posture := h.secretsService.GetPosture()
	envPosture := h.envService.GetEnvironmentPosture()

	c.JSON(http.StatusOK, gin.H{
		"posture":           posture,
		"environment_score": envPosture.EnvironmentScore,
		"env_checks":        envPosture.Checks,
		"era":               "22",
		"layer":             "Secrets Management & Cryptographic Security",
	})
}

// GetSecretsList returns the full inventory of secrets.
// GET /api/v2/secrets/list
func (h *V2SecretsSecurityHandler) GetSecretsList(c *gin.Context) {
	secrets := h.secretsService.ListSecrets()
	c.JSON(http.StatusOK, gin.H{
		"secrets": secrets,
		"total":   len(secrets),
	})
}

// GetSecretsStatus returns secret status metrics.
// GET /api/v2/secrets/status
func (h *V2SecretsSecurityHandler) GetSecretsStatus(c *gin.Context) {
	posture := h.secretsService.GetPosture()
	c.JSON(http.StatusOK, gin.H{
		"active":            posture.ActiveSecrets,
		"expiring_soon":     posture.ExpiringSecrets,
		"expired":           posture.ExpiredSecrets,
		"rotation_required": posture.RotationRequired,
		"revoked":           posture.RevokedSecrets,
		"total":             posture.TotalSecrets,
	})
}

// RegisterSecret registers a new secret metadata record.
// POST /api/v2/secrets/register
func (h *V2SecretsSecurityHandler) RegisterSecret(c *gin.Context) {
	var req struct {
		Name        string                `json:"name" binding:"required"`
		Type        models.SecretType     `json:"type" binding:"required"`
		Provider    models.SecretProvider `json:"provider" binding:"required"`
		RawValue    string                `json:"raw_value" binding:"required"`
		Owner       string                `json:"owner"`
		Environment string                `json:"environment"`
		ValidDays   int                   `json:"valid_days"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "INVALID_REQUEST_BODY"})
		return
	}

	if req.Owner == "" {
		req.Owner = "secops-admin"
	}
	if req.Environment == "" {
		req.Environment = "production"
	}

	sec := h.secretsService.RegisterSecret(req.Name, req.Type, req.Provider, req.RawValue, req.Owner, req.Environment, req.ValidDays)
	c.JSON(http.StatusCreated, gin.H{
		"status":  "registered",
		"secret":  sec,
		"message": "Secret registered successfully.",
	})
}

// RotateSecret rotates an existing secret.
// POST /api/v2/secrets/rotate
func (h *V2SecretsSecurityHandler) RotateSecret(c *gin.Context) {
	var req struct {
		SecretID string `json:"secret_id" binding:"required"`
		NewValue string `json:"new_value"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "INVALID_REQUEST_BODY"})
		return
	}

	sec, err := h.secretsService.RotateSecret(req.SecretID, req.NewValue)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error(), "code": "SECRET_NOT_FOUND"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "rotated",
		"secret":  sec,
		"message": "Secret rotated successfully.",
	})
}

// GetSecretEvents runs a leak detection scan and returns findings.
// GET /api/v2/secrets/events
func (h *V2SecretsSecurityHandler) GetSecretEvents(c *gin.Context) {
	// Sample scanning string simulation
	sampleContent := `
	# Production configuration sample
	DATABASE_URL=postgres://admin:vault_managed_9823h@localhost:5432/netsentinel
	GIN_MODE=release
	`
	report := h.leakService.ScanString(sampleContent)

	c.JSON(http.StatusOK, gin.H{
		"leak_report": report,
		"scanned_at":  report.ScannedAt,
	})
}

// GetCryptoPosture returns cryptographic compliance analysis.
// GET /api/v2/crypto/posture
func (h *V2SecretsSecurityHandler) GetCryptoPosture(c *gin.Context) {
	cryptoPosture := h.cryptoService.GetCryptoPosture()
	c.JSON(http.StatusOK, gin.H{
		"crypto_posture": cryptoPosture,
		"era":            "22",
	})
}
