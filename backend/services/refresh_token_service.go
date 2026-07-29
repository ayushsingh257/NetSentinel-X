package services

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// RefreshTokenService manages 30-day refresh tokens, rotation, hashing, and reuse attack detection.
type RefreshTokenService struct {
	mu     sync.RWMutex
	tokens map[string]*models.RefreshToken // token_hash -> record
	audit  *AuditService
}

// NewRefreshTokenService creates a new RefreshTokenService instance.
func NewRefreshTokenService(audit *AuditService) *RefreshTokenService {
	return &RefreshTokenService{
		tokens: make(map[string]*models.RefreshToken),
		audit:  audit,
	}
}

func (s *RefreshTokenService) hashToken(raw string) string {
	h := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(h[:])
}

// GenerateRefreshToken creates a 30-day refresh token, stores its hash, and returns the raw string.
func (s *RefreshTokenService) GenerateRefreshToken(userID, sessionID string) (string, time.Time, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", time.Time{}, err
	}
	rawToken := "nsx_ref_" + hex.EncodeToString(b)
	hash := s.hashToken(rawToken)

	expiry := time.Now().Add(30 * 24 * time.Hour)

	rec := &models.RefreshToken{
		ID:        "REF-" + time.Now().Format("150405"),
		UserID:    userID,
		TokenHash: hash,
		SessionID: sessionID,
		ExpiresAt: expiry,
		CreatedAt: time.Now(),
		Used:      false,
		Revoked:   false,
	}

	s.tokens[hash] = rec
	return rawToken, expiry, nil
}

// RotateRefreshToken validates a raw refresh token and executes single-use rotation.
// Returns (newRawRefreshToken, userID, sessionID, err).
// If a reused/invalidated refresh token is presented, returns ErrTokenReuse Detected so calling code revokes all sessions!
var ErrTokenReuseDetected = errors.New("TOKEN_REUSE_DETECTED: Refresh token has already been used")

func (s *RefreshTokenService) RotateRefreshToken(rawToken string) (string, string, string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	hash := s.hashToken(rawToken)
	rec, exists := s.tokens[hash]
	if !exists {
		return "", "", "", errors.New("invalid_or_revoked_refresh_token")
	}

	if time.Now().After(rec.ExpiresAt) {
		rec.Revoked = true
		return "", "", "", errors.New("refresh_token_expired")
	}

	// CRITICAL SECURITY: Detect Token Reuse Attack!
	if rec.Used || rec.Revoked {
		rec.Revoked = true
		rec.ReusedAt = time.Now()
		return "", rec.UserID, rec.SessionID, ErrTokenReuseDetected
	}

	// Mark current token as USED for rotation
	rec.Used = true

	// Generate NEW replacement refresh token
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", rec.UserID, rec.SessionID, err
	}
	newRaw := "nsx_ref_" + hex.EncodeToString(b)
	newHash := s.hashToken(newRaw)

	newExpiry := time.Now().Add(30 * 24 * time.Hour)
	newRec := &models.RefreshToken{
		ID:        "REF-" + time.Now().Format("150405"),
		UserID:    rec.UserID,
		TokenHash: newHash,
		SessionID: rec.SessionID,
		ExpiresAt: newExpiry,
		CreatedAt: time.Now(),
		Used:      false,
		Revoked:   false,
	}

	s.tokens[newHash] = newRec
	return newRaw, rec.UserID, rec.SessionID, nil
}

// RevokeUserTokens revokes all refresh tokens for a given user ID.
func (s *RefreshTokenService) RevokeUserTokens(userID string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, rec := range s.tokens {
		if rec.UserID == userID {
			rec.Revoked = true
		}
	}
}
