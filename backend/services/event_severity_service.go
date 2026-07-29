package services

import (
	"netsentinel-x-backend/models"
)

// EventSeverityService calculates security event severity classification levels.
type EventSeverityService struct{}

// NewEventSeverityService creates a new EventSeverityService instance.
func NewEventSeverityService() *EventSeverityService {
	return &EventSeverityService{}
}

// ClassifySeverity assigns a severity level (INFO, LOW, MEDIUM, HIGH, CRITICAL) to an event type.
func (s *EventSeverityService) ClassifySeverity(eventType string) models.EventSeverity {
	switch eventType {
	case "PRIVILEGE_ESCALATION", "TAMPERING_DETECTED", "SCHEMA_CHANGE", "UNAUTHORIZED_ADMIN_EXEC", "TOKEN_REUSE_DETECTED":
		return models.SeverityCritical

	case "SUSPICIOUS_LOGIN", "BRUTE_FORCE_ATTACK", "DATA_EXFILTRATION", "API_ABUSE_DETECTED", "RATE_LIMIT_TRIGGERED":
		return models.SeverityHigh

	case "LOGIN_FAILURE", "MFA_FAILURE", "PERMISSION_DENIED", "CONTAINER_FAILED", "SECURITY_SCAN_FAILED":
		return models.SeverityMedium

	case "API_KEY_REVOKED", "SESSION_REVOKED", "PASSWORD_CHANGE":
		return models.SeverityLow

	case "LOGIN_SUCCESS", "MFA_SUCCESS", "TOKEN_REFRESH", "DATA_READ", "DATA_MODIFIED", "API_KEY_CREATED", "CONTAINER_STARTED":
		return models.SeverityInfo

	default:
		return models.SeverityInfo
	}
}
