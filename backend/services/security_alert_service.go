package services

import (
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// SecurityAlertService manages SIEM alert lifecycle (OPEN, INVESTIGATING, RESOLVED).
type SecurityAlertService struct {
	mu     sync.RWMutex
	alerts []models.SIEMAlert
}

// NewSecurityAlertService initializes SecurityAlertService with pre-seeded SIEM alerts.
func NewSecurityAlertService() *SecurityAlertService {
	s := &SecurityAlertService{
		alerts: make([]models.SIEMAlert, 0),
	}
	s.seedAlerts()
	return s
}

func (s *SecurityAlertService) seedAlerts() {
	now := time.Now()

	s.alerts = append(s.alerts,
		models.SIEMAlert{
			AlertID:          "SIEM-ALT-1001",
			Severity:         models.SeverityCritical,
			Title:            "PRIVILEGE_ESCALATION",
			Description:      "User Analyst_Bob (SECURITY_ANALYST) attempted unauthorized execution on /api/v2/admin/system",
			AffectedUser:     "Analyst_Bob",
			AffectedResource: "/api/v2/admin/system",
			Timestamp:        now.Add(-15 * time.Minute),
			Status:           models.AlertOpen,
		},
		models.SIEMAlert{
			AlertID:          "SIEM-ALT-1002",
			Severity:         models.SeverityHigh,
			Title:            "BRUTE_FORCE_ATTACK",
			Description:      "Brute force login attack detected: 10 failed login attempts from IP 185.220.101.5 in 3 minutes",
			AffectedUser:     "Analyst_Bob",
			AffectedResource: "Auth API",
			Timestamp:        now.Add(-40 * time.Minute),
			Status:           models.AlertInvestigating,
		},
		models.SIEMAlert{
			AlertID:          "SIEM-ALT-1003",
			Severity:         models.SeverityHigh,
			Title:            "IMPOSSIBLE_TRAVEL_BLOCKED",
			Description:      "Impossible travel velocity anomaly: Delhi to Frankfurt in 5 minutes",
			AffectedUser:     "Analyst_Bob",
			AffectedResource: "Session Security Engine",
			Timestamp:        now.Add(-1 * time.Hour),
			Status:           models.AlertResolved,
		},
	)
}

// CreateAlert creates a new SIEM alert.
func (s *SecurityAlertService) CreateAlert(severity models.EventSeverity, title, description, user, resource string) *models.SIEMAlert {
	s.mu.Lock()
	defer s.mu.Unlock()

	alertID := fmt.Sprintf("SIEM-ALT-%d", len(s.alerts)+1001)
	alert := models.SIEMAlert{
		AlertID:          alertID,
		Severity:         severity,
		Title:            title,
		Description:      description,
		AffectedUser:     user,
		AffectedResource: resource,
		Timestamp:        time.Now(),
		Status:           models.AlertOpen,
	}

	s.alerts = append([]models.SIEMAlert{alert}, s.alerts...)
	return &alert
}

// ResolveAlert updates an alert's status to RESOLVED.
func (s *SecurityAlertService) ResolveAlert(alertID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.alerts {
		if s.alerts[i].AlertID == alertID {
			s.alerts[i].Status = models.AlertResolved
			return true
		}
	}
	return false
}

// GetAlerts returns all SIEM alerts.
func (s *SecurityAlertService) GetAlerts() []models.SIEMAlert {
	s.mu.RLock()
	defer s.mu.RUnlock()

	res := make([]models.SIEMAlert, len(s.alerts))
	copy(res, s.alerts)
	return res
}
