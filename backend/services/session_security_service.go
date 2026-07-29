package services

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// SessionSecurityService tracks active user sessions, device metadata, and instant revocation.
type SessionSecurityService struct {
	mu       sync.RWMutex
	sessions map[string]*models.UserSession // session_id -> record
}

// NewSessionSecurityService creates a new SessionSecurityService with seeded demo sessions.
func NewSessionSecurityService() *SessionSecurityService {
	s := &SessionSecurityService{
		sessions: make(map[string]*models.UserSession),
	}
	s.seedSessions()
	return s
}

func (s *SessionSecurityService) seedSessions() {
	now := time.Now()

	s.sessions["SESS-1001"] = &models.UserSession{
		SessionID:    "SESS-1001",
		UserID:       "USR-001",
		Username:     "Ayush",
		Role:         "SUPER_ADMIN",
		Device:       "Windows 11 PC",
		Browser:      "Chrome 126.0",
		IPAddress:    "103.21.124.50",
		Location:     "New Delhi, India",
		CreatedAt:    now.Add(-2 * time.Hour),
		LastActivity: now.Add(-5 * time.Minute),
		RiskScore:    10,
		Status:       models.SessionActive,
	}

	s.sessions["SESS-1002"] = &models.UserSession{
		SessionID:    "SESS-1002",
		UserID:       "USR-002",
		Username:     "Sarah_SOC",
		Role:         "SOC_ADMIN",
		Device:       "MacBook Pro M3",
		Browser:      "Safari 17.4",
		IPAddress:    "49.207.180.12",
		Location:     "Mumbai, India",
		CreatedAt:    now.Add(-4 * time.Hour),
		LastActivity: now.Add(-12 * time.Minute),
		RiskScore:    15,
		Status:       models.SessionActive,
	}

	s.sessions["SESS-1003"] = &models.UserSession{
		SessionID:    "SESS-1003",
		UserID:       "USR-003",
		Username:     "Analyst_Bob",
		Role:         "SECURITY_ANALYST",
		Device:       "Linux Workstation",
		Browser:      "Firefox 125.0",
		IPAddress:    "185.220.101.5",
		Location:     "Frankfurt, Germany",
		CreatedAt:    now.Add(-1 * time.Hour),
		LastActivity: now.Add(-2 * time.Minute),
		RiskScore:    85,
		Status:       models.SessionSuspicious,
	}
}

// CreateSession registers a new active user session.
func (s *SessionSecurityService) CreateSession(userID, username, role, device, browser, ip, location string, riskScore int) *models.UserSession {
	s.mu.Lock()
	defer s.mu.Unlock()

	b := make([]byte, 4)
	rand.Read(b)
	sessID := "SESS-" + time.Now().Format("150405") + "-" + hex.EncodeToString(b)
	sess := &models.UserSession{
		SessionID:    sessID,
		UserID:       userID,
		Username:     username,
		Role:         role,
		Device:       device,
		Browser:      browser,
		IPAddress:    ip,
		Location:     location,
		CreatedAt:    time.Now(),
		LastActivity: time.Now(),
		RiskScore:    riskScore,
		Status:       models.SessionActive,
	}

	if riskScore > 70 {
		sess.Status = models.SessionSuspicious
	}

	s.sessions[sessID] = sess
	return sess
}

// GetActiveSessions returns all sessions across the platform.
func (s *SessionSecurityService) GetActiveSessions() []models.UserSession {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.UserSession, 0, len(s.sessions))
	for _, sess := range s.sessions {
		result = append(result, *sess)
	}
	return result
}

// GetUserSessions returns sessions for a specific user.
func (s *SessionSecurityService) GetUserSessions(userID string) []models.UserSession {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.UserSession, 0)
	for _, sess := range s.sessions {
		if sess.UserID == userID {
			result = append(result, *sess)
		}
	}
	return result
}

// RevokeSession terminates a single active session immediately.
func (s *SessionSecurityService) RevokeSession(sessionID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	sess, exists := s.sessions[sessionID]
	if !exists {
		return errors.New("session_not_found")
	}

	sess.Status = models.SessionRevoked
	return nil
}

// RevokeAllUserSessions terminates all active sessions for a target user ID.
func (s *SessionSecurityService) RevokeAllUserSessions(userID string) int {
	s.mu.Lock()
	defer s.mu.Unlock()

	revokedCount := 0
	for _, sess := range s.sessions {
		if sess.UserID == userID && sess.Status != models.SessionRevoked {
			sess.Status = models.SessionRevoked
			revokedCount++
		}
	}
	return revokedCount
}
