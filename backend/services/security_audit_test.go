package services

import (
	"testing"
)

func TestSecurityAuditService(t *testing.T) {
	service := NewSecurityAuditService()

	t.Run("GetPosture Calculates Score", func(t *testing.T) {
		posture := service.GetPosture()
		if posture.SecurityScore < 90 {
			t.Errorf("Expected security score >= 90, got %d", posture.SecurityScore)
		}
		if posture.AuthenticationStatus != "HEALTHY" {
			t.Errorf("Expected authentication status HEALTHY, got %s", posture.AuthenticationStatus)
		}
	})

	t.Run("GetSecurityEvents Returns Events", func(t *testing.T) {
		events := service.GetSecurityEvents()
		if len(events) < 3 {
			t.Fatalf("Expected at least 3 security events, got %d", len(events))
		}
	})
}
