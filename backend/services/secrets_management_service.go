package services

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// SecretsPosture holds aggregate metrics for the secrets security dashboard.
type SecretsPosture struct {
	OverallScore     int             `json:"overall_score"`
	Grade            string          `json:"grade"`
	ActiveSecrets    int             `json:"active_secrets"`
	ExpiringSecrets  int             `json:"expiring_secrets"`
	ExpiredSecrets   int             `json:"expired_secrets"`
	RotationRequired int             `json:"rotation_required"`
	RevokedSecrets   int             `json:"revoked_secrets"`
	TotalSecrets     int             `json:"total_secrets"`
	SecretsList      []models.Secret `json:"secrets"`
	GeneratedAt      time.Time       `json:"generated_at"`
}

// SecretsManagementService manages enterprise secrets, vault abstraction, and rotation engines.
type SecretsManagementService struct {
	mu           sync.RWMutex
	secrets      map[string]models.Secret // secretID -> Secret
	auditService *AuditService
}

// NewSecretsManagementService initializes the secrets management service with seeded enterprise secrets.
func NewSecretsManagementService(audit *AuditService) *SecretsManagementService {
	s := &SecretsManagementService{
		secrets:      make(map[string]models.Secret),
		auditService: audit,
	}
	s.seedDefaultSecrets()
	return s
}

func (s *SecretsManagementService) hashValue(val string) string {
	h := sha256.Sum256([]byte(val))
	return hex.EncodeToString(h[:])
}

func (s *SecretsManagementService) seedDefaultSecrets() {
	now := time.Now()

	defaultSecrets := []models.Secret{
		{
			ID:              "SEC-001",
			Name:            "Production JWT Signing Key",
			Type:            models.SecretTypeJWT,
			Provider:        models.ProviderHashiCorpVault,
			Status:          models.SecretStatusActive,
			ValueHash:       s.hashValue("nsx_jwt_prod_key_32bytes_minimum_secret"),
			MaskedPrefix:    "nsx_jwt_prod****",
			Owner:           "secops-admin",
			Environment:     "production",
			CreatedAt:       now.Add(-30 * 24 * time.Hour),
			ExpiresAt:       now.Add(60 * 24 * time.Hour),
			LastRotated:     now.Add(-12 * 24 * time.Hour),
			RotationCount:   3,
			RotationHistory: []string{now.Add(-90 * 24 * time.Hour).Format(time.RFC3339), now.Add(-45 * 24 * time.Hour).Format(time.RFC3339), now.Add(-12 * 24 * time.Hour).Format(time.RFC3339)},
		},
		{
			ID:              "SEC-002",
			Name:            "PostgreSQL Master Database Credential",
			Type:            models.SecretTypeDatabase,
			Provider:        models.ProviderAWSSecrets,
			Status:          models.SecretStatusActive,
			ValueHash:       s.hashValue("db_pass_vault_managed_9823h"),
			MaskedPrefix:    "db_pass_vau****",
			Owner:           "dba-team",
			Environment:     "production",
			CreatedAt:       now.Add(-60 * 24 * time.Hour),
			ExpiresAt:       now.Add(30 * 24 * time.Hour),
			LastRotated:     now.Add(-25 * 24 * time.Hour),
			RotationCount:   2,
			RotationHistory: []string{now.Add(-60 * 24 * time.Hour).Format(time.RFC3339), now.Add(-25 * 24 * time.Hour).Format(time.RFC3339)},
		},
		{
			ID:              "SEC-003",
			Name:            "SIEM Webhook Signature HMAC Key",
			Type:            models.SecretTypeWebhook,
			Provider:        models.ProviderEncryptedStore,
			Status:          models.SecretStatusExpiringSoon,
			ValueHash:       s.hashValue("whsec_98234791283719827391"),
			MaskedPrefix:    "whsec_98234****",
			Owner:           "soc-lead",
			Environment:     "production",
			CreatedAt:       now.Add(-85 * 24 * time.Hour),
			ExpiresAt:       now.Add(5 * 24 * time.Hour),
			LastRotated:     now.Add(-85 * 24 * time.Hour),
			RotationCount:   1,
			RotationHistory: []string{now.Add(-85 * 24 * time.Hour).Format(time.RFC3339)},
		},
		{
			ID:              "SEC-004",
			Name:            "Threat Intel API Integration Secret",
			Type:            models.SecretTypeAPIKey,
			Provider:        models.ProviderAzureKeyVault,
			Status:          models.SecretStatusActive,
			ValueHash:       s.hashValue("nsx_live_threatintel_feed_992"),
			MaskedPrefix:    "nsx_live_th****",
			Owner:           "intel-analyst",
			Environment:     "production",
			CreatedAt:       now.Add(-10 * 24 * time.Hour),
			ExpiresAt:       now.Add(80 * 24 * time.Hour),
			LastRotated:     now.Add(-10 * 24 * time.Hour),
			RotationCount:   1,
			RotationHistory: []string{now.Add(-10 * 24 * time.Hour).Format(time.RFC3339)},
		},
		{
			ID:              "SEC-005",
			Name:            "AES-256 Storage Encryption Master Key",
			Type:            models.SecretTypeEncryption,
			Provider:        models.ProviderHashiCorpVault,
			Status:          models.SecretStatusActive,
			ValueHash:       s.hashValue("aes256_master_enc_key_00192837"),
			MaskedPrefix:    "aes256_mast****",
			Owner:           "secops-admin",
			Environment:     "production",
			CreatedAt:       now.Add(-120 * 24 * time.Hour),
			ExpiresAt:       now.Add(245 * 24 * time.Hour),
			LastRotated:     now.Add(-30 * 24 * time.Hour),
			RotationCount:   4,
			RotationHistory: []string{now.Add(-120 * 24 * time.Hour).Format(time.RFC3339), now.Add(-30 * 24 * time.Hour).Format(time.RFC3339)},
		},
	}

	for _, sec := range defaultSecrets {
		s.secrets[sec.ID] = sec
	}
}

// GetPosture returns aggregate secrets posture analysis.
func (s *SecretsManagementService) GetPosture() *SecretsPosture {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var active, expiring, expired, rotationReq, revoked int
	var secretsList []models.Secret

	now := time.Now()

	for _, sec := range s.secrets {
		// Update status dynamically if expired
		secCopy := sec
		if now.After(secCopy.ExpiresAt) && secCopy.Status != models.SecretStatusRevoked {
			secCopy.Status = models.SecretStatusExpired
		} else if secCopy.ExpiresAt.Sub(now) < 7*24*time.Hour && secCopy.Status == models.SecretStatusActive {
			secCopy.Status = models.SecretStatusExpiringSoon
		}

		switch secCopy.Status {
		case models.SecretStatusActive:
			active++
		case models.SecretStatusExpiringSoon:
			expiring++
		case models.SecretStatusExpired:
			expired++
		case models.SecretStatusRotationRequired:
			rotationReq++
		case models.SecretStatusRevoked:
			revoked++
		}

		secretsList = append(secretsList, secCopy)
	}

	total := len(secretsList)
	score := 100
	if expired > 0 {
		score -= expired * 25
	}
	if rotationReq > 0 {
		score -= rotationReq * 20
	}
	if expiring > 0 {
		score -= expiring * 5
	}
	if score < 0 {
		score = 0
	}

	grade := "A+"
	if score < 60 {
		grade = "F"
	} else if score < 75 {
		grade = "C"
	} else if score < 90 {
		grade = "B"
	}

	return &SecretsPosture{
		OverallScore:     score,
		Grade:            grade,
		ActiveSecrets:    active,
		ExpiringSecrets:  expiring,
		ExpiredSecrets:   expired,
		RotationRequired: rotationReq,
		RevokedSecrets:   revoked,
		TotalSecrets:     total,
		SecretsList:      secretsList,
		GeneratedAt:      now,
	}
}

// RegisterSecret creates a new secret record.
func (s *SecretsManagementService) RegisterSecret(name string, secType models.SecretType, provider models.SecretProvider, rawVal, owner, env string, validDays int) models.Secret {
	s.mu.Lock()
	defer s.mu.Unlock()

	bytes := make([]byte, 8)
	_, _ = rand.Read(bytes)
	randHex := hex.EncodeToString(bytes)

	now := time.Now()
	status := models.SecretStatusActive
	var expiresAt time.Time
	if validDays <= 0 {
		expiresAt = now.Add(-24 * time.Hour)
		status = models.SecretStatusExpired
	} else {
		expiresAt = now.Add(time.Duration(validDays) * 24 * time.Hour)
	}

	prefix := rawVal
	if len(rawVal) > 8 {
		prefix = rawVal[:8] + "****"
	}

	sec := models.Secret{
		ID:              fmt.Sprintf("SEC-%s", randHex[:6]),
		Name:            name,
		Type:            secType,
		Provider:        provider,
		Status:          status,
		ValueHash:       s.hashValue(rawVal),
		MaskedPrefix:    prefix,
		Owner:           owner,
		Environment:     env,
		CreatedAt:       now,
		ExpiresAt:       expiresAt,
		LastRotated:     now,
		RotationCount:   1,
		RotationHistory: []string{now.Format(time.RFC3339)},
	}

	s.secrets[sec.ID] = sec
	return sec
}

// RotateSecret executes an automated rotation for a given secret ID.
func (s *SecretsManagementService) RotateSecret(secretID, newRawVal string) (*models.Secret, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	sec, exists := s.secrets[secretID]
	if !exists {
		return nil, fmt.Errorf("secret with ID %s not found", secretID)
	}

	now := time.Now()
	if newRawVal == "" {
		// Generate random new secret value simulation
		b := make([]byte, 16)
		_, _ = rand.Read(b)
		newRawVal = fmt.Sprintf("nsx_rotated_%s", hex.EncodeToString(b))
	}

	sec.ValueHash = s.hashValue(newRawVal)
	if len(newRawVal) > 8 {
		sec.MaskedPrefix = newRawVal[:8] + "****"
	} else {
		sec.MaskedPrefix = newRawVal + "****"
	}

	sec.Status = models.SecretStatusActive
	sec.LastRotated = now
	sec.ExpiresAt = now.Add(90 * 24 * time.Hour)
	sec.RotationCount++
	sec.RotationHistory = append(sec.RotationHistory, now.Format(time.RFC3339))

	s.secrets[secretID] = sec
	return &sec, nil
}

// RevokeSecret marks a secret as REVOKED immediately.
func (s *SecretsManagementService) RevokeSecret(secretID string) (*models.Secret, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	sec, exists := s.secrets[secretID]
	if !exists {
		return nil, fmt.Errorf("secret with ID %s not found", secretID)
	}

	sec.Status = models.SecretStatusRevoked
	s.secrets[secretID] = sec
	return &sec, nil
}

// ListSecrets returns all registered secrets.
func (s *SecretsManagementService) ListSecrets() []models.Secret {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []models.Secret
	for _, sec := range s.secrets {
		list = append(list, sec)
	}
	return list
}
