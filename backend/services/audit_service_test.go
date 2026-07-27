package services

import (
	"netsentinel-x-backend/models"
	"testing"
)

func TestAuditService(t *testing.T) {
	service := NewAuditService()

	t.Run("GetLogs Returns Seed Logs", func(t *testing.T) {
		logs := service.GetLogs(0)
		if len(logs) < 4 {
			t.Fatalf("Expected at least 4 seed audit logs, got %d", len(logs))
		}
	})

	t.Run("LogEvent Adds New Audit Record", func(t *testing.T) {
		newEvent := models.AuditLog{
			UserID:   "USR-999",
			Username: "Test User",
			Action:   "USER_LOGIN",
			Category: "AUTHENTICATION",
			Severity: "LOW",
		}
		created := service.LogEvent(newEvent)
		if created.ID == "" {
			t.Error("Expected auto-generated ID for audit log")
		}
		if created.Status != "SUCCESS" {
			t.Errorf("Expected status SUCCESS, got %s", created.Status)
		}
	})

	t.Run("SearchLogs By Category Filter", func(t *testing.T) {
		results := service.SearchLogs("", "THREAT_HUNT", "", "")
		if len(results) < 1 {
			t.Error("Expected at least 1 result for THREAT_HUNT category")
		}
		for _, r := range results {
			if r.Category != "THREAT_HUNT" {
				t.Errorf("Expected category THREAT_HUNT, got %s", r.Category)
			}
		}
	})

	t.Run("SearchLogs By Query Text", func(t *testing.T) {
		results := service.SearchLogs("Ayush", "", "", "")
		if len(results) < 1 {
			t.Error("Expected at least 1 result for query 'Ayush'")
		}
	})

	t.Run("ExportLogs Generates CSV Output", func(t *testing.T) {
		csv := service.ExportLogs()
		if len(csv) == 0 {
			t.Fatal("Expected non-empty CSV string")
		}
		if !stringsContains(csv, "ID,Timestamp,Username") {
			t.Error("Expected CSV header in exported output")
		}
	})
}

func stringsContains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && searchSubstring(s, substr))
}

func searchSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
