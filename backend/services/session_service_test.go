package services

import (
	"testing"
)

func TestSessionService(t *testing.T) {
	service := NewSecurityAuditService()

	t.Run("GetActiveSessions Returns Seed Sessions", func(t *testing.T) {
		sessions := service.GetActiveSessions()
		if len(sessions) < 2 {
			t.Fatalf("Expected at least 2 active sessions, got %d", len(sessions))
		}
	})

	t.Run("RevokeSession Deactivates Session", func(t *testing.T) {
		success := service.RevokeSession("SES-1001")
		if !success {
			t.Fatal("Expected RevokeSession to return true for SES-1001")
		}
		sessions := service.GetActiveSessions()
		for _, s := range sessions {
			if s.SessionID == "SES-1001" {
				t.Error("Expected revoked session SES-1001 not to be in active list")
			}
		}
	})
}
