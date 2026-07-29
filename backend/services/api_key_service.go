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

type APIKeyService struct {
	mu   sync.RWMutex
	keys map[string]models.APIKey // keyHash -> APIKey
}

func NewAPIKeyService() *APIKeyService {
	s := &APIKeyService{
		keys: make(map[string]models.APIKey),
	}
	s.seedDefaultKeys()
	return s
}

func (s *APIKeyService) hashKey(plaintextKey string) string {
	hash := sha256.Sum256([]byte(plaintextKey))
	return hex.EncodeToString(hash[:])
}

func (s *APIKeyService) seedDefaultKeys() {
	now := time.Now()
	// Seed a default valid API key for integration testing
	defaultKey := "nsx_live_a82hd72jd82h"
	hash := s.hashKey(defaultKey)
	s.keys[hash] = models.APIKey{
		ID:          "KEY-1001",
		Name:        "Production Integration Key",
		KeyHash:     hash,
		Prefix:      "nsx_live_a82h",
		OwnerID:     "USR-001",
		Permissions: []string{"VIEW_INCIDENTS", "RUN_THREAT_HUNTS", "CREATE_RULES", "ALL_PERMISSIONS"},
		CreatedAt:   now.Add(-24 * time.Hour),
		ExpiryDate:  now.Add(365 * 24 * time.Hour),
		LastUsed:    now.Add(-5 * time.Minute),
		Status:      "ACTIVE",
	}
}

// GenerateAPIKey creates a plaintext key, hashes it with SHA256, and stores the metadata.
func (s *APIKeyService) GenerateAPIKey(name, ownerID string, permissions []string, durationDays int) (string, models.APIKey) {
	bytes := make([]byte, 16)
	_, _ = rand.Read(bytes)
	rawHex := hex.EncodeToString(bytes)
	plaintextKey := fmt.Sprintf("nsx_live_%s", rawHex)
	prefix := plaintextKey[:12]

	hash := s.hashKey(plaintextKey)

	now := time.Now()
	if durationDays <= 0 {
		durationDays = 90
	}

	keyObj := models.APIKey{
		ID:          fmt.Sprintf("KEY-%d", now.UnixNano()%100000),
		Name:        name,
		KeyHash:     hash,
		Prefix:      prefix,
		OwnerID:     ownerID,
		Permissions: permissions,
		CreatedAt:   now,
		ExpiryDate:  now.Add(time.Duration(durationDays) * 24 * time.Hour),
		LastUsed:    now,
		Status:      "ACTIVE",
	}

	s.mu.Lock()
	s.keys[hash] = keyObj
	s.mu.Unlock()

	return plaintextKey, keyObj
}

// ValidateAPIKey verifies key signature, expiration, and status.
func (s *APIKeyService) ValidateAPIKey(plaintextKey string) (bool, string, models.APIKey) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if plaintextKey == "" {
		return false, "API_KEY_REQUIRED", models.APIKey{}
	}

	hash := s.hashKey(plaintextKey)
	keyObj, exists := s.keys[hash]
	if !exists {
		return false, "INVALID_API_KEY", models.APIKey{}
	}

	if keyObj.Status != "ACTIVE" {
		return false, "API_KEY_REVOKED", keyObj
	}

	if time.Now().After(keyObj.ExpiryDate) {
		keyObj.Status = "EXPIRED"
		s.keys[hash] = keyObj
		return false, "API_KEY_EXPIRED", keyObj
	}

	// Update last used timestamp
	keyObj.LastUsed = time.Now()
	s.keys[hash] = keyObj

	return true, "ACTIVE", keyObj
}

// RevokeAPIKey marks an API key as REVOKED.
func (s *APIKeyService) RevokeAPIKey(keyID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	for hash, k := range s.keys {
		if k.ID == keyID {
			k.Status = "REVOKED"
			s.keys[hash] = k
			return true
		}
	}
	return false
}

// ListAPIKeys returns all managed API keys.
func (s *APIKeyService) ListAPIKeys() []models.APIKey {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.APIKey
	for _, k := range s.keys {
		result = append(result, k)
	}
	return result
}
