package models

import "time"

// SecretStatus represents the lifecycle state of a managed secret.
type SecretStatus string

const (
	SecretStatusActive           SecretStatus = "ACTIVE"
	SecretStatusExpiringSoon     SecretStatus = "EXPIRING_SOON"
	SecretStatusExpired          SecretStatus = "EXPIRED"
	SecretStatusRevoked          SecretStatus = "REVOKED"
	SecretStatusRotationRequired SecretStatus = "ROTATION_REQUIRED"
)

// SecretType represents the domain category of a secret.
type SecretType string

const (
	SecretTypeJWT        SecretType = "JWT_SIGNING_KEY"
	SecretTypeDatabase   SecretType = "DATABASE_CREDENTIAL"
	SecretTypeAPIKey     SecretType = "API_KEY"
	SecretTypeOAuth      SecretType = "OAUTH_SECRET"
	SecretTypeWebhook    SecretType = "WEBHOOK_SECRET"
	SecretTypeEncryption SecretType = "ENCRYPTION_KEY"
)

// SecretProvider represents the underlying vault or storage engine.
type SecretProvider string

const (
	ProviderHashiCorpVault SecretProvider = "HASHICORP_VAULT"
	ProviderAWSSecrets     SecretProvider = "AWS_SECRETS_MANAGER"
	ProviderAzureKeyVault  SecretProvider = "AZURE_KEY_VAULT"
	ProviderGitHubSecrets  SecretProvider = "GITHUB_SECRETS"
	ProviderEncryptedStore SecretProvider = "INTERNAL_ENCRYPTED_STORE"
)

// Secret represents a tracked enterprise secret definition.
type Secret struct {
	ID              string         `json:"id"`
	Name            string         `json:"name"`
	Type            SecretType     `json:"type"`
	Provider        SecretProvider `json:"provider"`
	Status          SecretStatus   `json:"status"`
	ValueHash       string         `json:"value_hash"`    // SHA-256 hash of secret value (never plaintext)
	MaskedPrefix    string         `json:"masked_prefix"` // e.g. "nsx_live_a82h****"
	Owner           string         `json:"owner"`
	Environment     string         `json:"environment"` // production, staging, development
	CreatedAt       time.Time      `json:"created_at"`
	ExpiresAt       time.Time      `json:"expires_at"`
	LastRotated     time.Time      `json:"last_rotated"`
	RotationCount   int            `json:"rotation_count"`
	RotationHistory []string       `json:"rotation_history"` // Timestamps of past rotations
}
