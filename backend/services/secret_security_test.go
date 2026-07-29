package services

import (
	"testing"

	"netsentinel-x-backend/models"

	"github.com/stretchr/testify/assert"
)

func TestSecretSecuritySuite(t *testing.T) {
	audit := NewAuditService()
	secService := NewSecretsManagementService(audit)
	cryptoService := NewCryptographicSecurityService()
	leakService := NewSecretDetectionService()
	envService := NewEnvironmentSecurityService()

	// Test 1: Plaintext / Weak password detection -> BLOCKED
	t.Run("Test 1: Plaintext password detection", func(t *testing.T) {
		valid, errCode := cryptoService.ValidatePasswordSecurity("password123")
		assert.False(t, valid, "Plaintext / dictionary password must be blocked")
		assert.Equal(t, "WEAK_DICTIONARY_PASSWORD_REJECTED", errCode)

		tooShortValid, tooShortCode := cryptoService.ValidatePasswordSecurity("short")
		assert.False(t, tooShortValid)
		assert.Equal(t, "PASSWORD_TOO_SHORT_MIN_12_CHARS", tooShortCode)
	})

	// Test 2: Weak JWT secret -> CRITICAL
	t.Run("Test 2: Weak JWT secret detection", func(t *testing.T) {
		t.Setenv("JWT_SECRET", "secret123")
		envPosture := envService.GetEnvironmentPosture()

		assert.False(t, envPosture.JWTSecretSecure, "Weak JWT secret 'secret123' must be flagged as insecure")
		jwtCheckFailed := false
		for _, c := range envPosture.Checks {
			if c.Check == "JWT Secret Strength" && c.Severity == "critical" && !c.Passed {
				jwtCheckFailed = true
			}
		}
		assert.True(t, jwtCheckFailed, "JWT Secret Strength check must be critical and failed")
	})

	// Test 3: Expired secret -> ROTATION_REQUIRED
	t.Run("Test 3: Expired secret requires rotation", func(t *testing.T) {
		// Register a secret with negative valid days so it's instantly expired
		sec := secService.RegisterSecret("Expired Integration Key", models.SecretTypeAPIKey, models.ProviderEncryptedStore, "nsx_live_expired_key_12345", "test-user", "production", -1)
		posture := secService.GetPosture()

		foundExpired := false
		for _, s := range posture.SecretsList {
			if s.ID == sec.ID {
				assert.Equal(t, models.SecretStatusExpired, s.Status)
				foundExpired = true
			}
		}
		assert.True(t, foundExpired, "Expired secret must be tracked with EXPIRED status requiring rotation")
	})

	// Test 4: Secret leak detection -> DETECTED
	t.Run("Test 4: Secret leak detection", func(t *testing.T) {
		payload := `
		aws_key_id = "AKIAIOSFODNN7EXAMPLE"
		jwt_secret = "JWT_SECRET=supersecret123"
		`
		report := leakService.ScanString(payload)
		assert.False(t, report.CleanDeployment, "Leak report must not be clean when secrets are present")
		assert.GreaterOrEqual(t, report.TotalLeaks, 2, "Must detect AWS key and JWT secret leaks")
		assert.GreaterOrEqual(t, report.CriticalLeaks, 1, "Must contain critical severity leak finding")
	})

	// Test 5: Valid encrypted secret -> SECURE
	t.Run("Test 5: Valid encrypted secret", func(t *testing.T) {
		sec := secService.RegisterSecret("Vault Encrypted DB Pass", models.SecretTypeDatabase, models.ProviderHashiCorpVault, "db_pass_secure_rand_892347128937", "dba-admin", "production", 90)
		assert.Equal(t, models.SecretStatusActive, sec.Status)
		assert.Equal(t, models.ProviderHashiCorpVault, sec.Provider)
		assert.NotEmpty(t, sec.ValueHash, "Value hash must be computed")
		assert.NotEqual(t, "db_pass_secure_rand_892347128937", sec.ValueHash, "Plaintext value must never be stored as hash")

		// Execute rotation
		rotated, err := secService.RotateSecret(sec.ID, "db_pass_secure_new_value_99234")
		assert.NoError(t, err)
		assert.Equal(t, models.SecretStatusActive, rotated.Status)
		assert.Equal(t, 2, rotated.RotationCount)
	})
}

func TestCryptographicAlgorithms(t *testing.T) {
	cryptoService := NewCryptographicSecurityService()
	posture := cryptoService.GetCryptoPosture()

	assert.GreaterOrEqual(t, posture.OverallScore, 80)
	assert.GreaterOrEqual(t, posture.ApprovedAlgos, 4)
	assert.GreaterOrEqual(t, posture.WeakAlgosRejected, 3)

	valid, _ := cryptoService.ValidateAlgorithm("MD5")
	assert.False(t, valid, "MD5 algorithm must be rejected as weak")

	validAES, _ := cryptoService.ValidateAlgorithm("AES-256-GCM")
	assert.True(t, validAES, "AES-256-GCM must be accepted as approved")
}

func TestSecretsRevocation(t *testing.T) {
	audit := NewAuditService()
	secService := NewSecretsManagementService(audit)

	sec := secService.RegisterSecret("Revocable Secret", models.SecretTypeAPIKey, models.ProviderGitHubSecrets, "nsx_live_revocable_123", "owner", "staging", 30)
	revoked, err := secService.RevokeSecret(sec.ID)

	assert.NoError(t, err)
	assert.Equal(t, models.SecretStatusRevoked, revoked.Status)
}
