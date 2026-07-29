package services

import (
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// AuthEventService records and queries identity authentication security audit trails.
type AuthEventService struct {
	mu     sync.RWMutex
	events []models.AuthEvent
}

// NewAuthEventService initializes AuthEventService with seeded events.
func NewAuthEventService() *AuthEventService {
	s := &AuthEventService{
		events: make([]models.AuthEvent, 0),
	}
	s.seedAuthEvents()
	return s
}

func (s *AuthEventService) seedAuthEvents() {
	now := time.Now()

	s.events = append(s.events,
		models.AuthEvent{
			ID:        "AUTHEVT-1001",
			EventType: "LOGIN_SUCCESS",
			UserID:    "USR-001",
			Username:  "Ayush",
			IP:        "103.21.124.50",
			Device:    "Windows 11 PC",
			Location:  "New Delhi, India",
			RiskScore: 10,
			Timestamp: now.Add(-10 * time.Minute),
			Details:   "Successful password & TOTP MFA login",
		},
		models.AuthEvent{
			ID:        "AUTHEVT-1002",
			EventType: "TOKEN_REFRESH",
			UserID:    "USR-002",
			Username:  "Sarah_SOC",
			IP:        "49.207.180.12",
			Device:    "MacBook Pro M3",
			Location:  "Mumbai, India",
			RiskScore: 15,
			Timestamp: now.Add(-25 * time.Minute),
			Details:   "15-min access token renewed via rotating refresh token",
		},
		models.AuthEvent{
			ID:        "AUTHEVT-1003",
			EventType: "SUSPICIOUS_LOGIN",
			UserID:    "USR-003",
			Username:  "Analyst_Bob",
			IP:        "185.220.101.5",
			Device:    "Linux Workstation",
			Location:  "Frankfurt, Germany",
			RiskScore: 85,
			Timestamp: now.Add(-1 * time.Hour),
			Details:   "Impossible travel detected from India to Germany (Velocity: 1400 km/h). Login BLOCKED.",
		},
		models.AuthEvent{
			ID:        "AUTHEVT-1004",
			EventType: "MFA_FAILURE",
			UserID:    "USR-004",
			Username:  "Dev_User",
			IP:        "198.51.100.20",
			Device:    "Android Phone",
			Location:  "Bengaluru, India",
			RiskScore: 45,
			Timestamp: now.Add(-3 * time.Hour),
			Details:   "Invalid 6-digit TOTP passcode attempt",
		},
		models.AuthEvent{
			ID:        "AUTHEVT-1005",
			EventType: "SESSION_REVOKED",
			UserID:    "USR-003",
			Username:  "Analyst_Bob",
			IP:        "103.21.124.50",
			Device:    "Windows PC",
			Location:  "New Delhi, India",
			RiskScore: 90,
			Timestamp: now.Add(-4 * time.Hour),
			Details:   "Admin terminated session SESS-1003 due to suspicious activity",
		},
	)
}

// LogEvent records a new identity authentication security event.
func (s *AuthEventService) LogEvent(eventType, userID, username, ip, device, location, details string, riskScore int) models.AuthEvent {
	s.mu.Lock()
	defer s.mu.Unlock()

	evt := models.AuthEvent{
		ID:        "AUTHEVT-" + time.Now().Format("150405"),
		EventType: eventType,
		UserID:    userID,
		Username:  username,
		IP:        ip,
		Device:    device,
		Location:  location,
		RiskScore: riskScore,
		Timestamp: time.Now(),
		Details:   details,
	}

	s.events = append([]models.AuthEvent{evt}, s.events...)
	if len(s.events) > 500 {
		s.events = s.events[:500]
	}
	return evt
}

// GetAuthEvents returns recorded identity security events.
func (s *AuthEventService) GetAuthEvents() []models.AuthEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.AuthEvent, len(s.events))
	copy(result, s.events)
	return result
}
