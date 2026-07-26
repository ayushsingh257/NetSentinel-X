package services

import (
	"testing"
)

func TestIncidentService(t *testing.T) {
	service := NewIncidentService()

	t.Run("GetOverview Structure", func(t *testing.T) {
		overview := service.GetOverview()
		if overview.TotalIncidents < 2 {
			t.Fatalf("Expected at least 2 seeded incidents, got %d", overview.TotalIncidents)
		}
		if overview.OpenIncidents < 1 {
			t.Errorf("Expected open incidents >= 1, got %d", overview.OpenIncidents)
		}
	})

	t.Run("GetIncidents List", func(t *testing.T) {
		list := service.GetIncidents()
		if len(list) < 2 {
			t.Errorf("Expected incidents list length >= 2, got %d", len(list))
		}
	})

	t.Run("GetIncidentByID Valid", func(t *testing.T) {
		inc, exists := service.GetIncidentByID("INC-2026-8001")
		if !exists {
			t.Fatal("Expected INC-2026-8001 to exist")
		}
		if inc.Severity != "CRITICAL" {
			t.Errorf("Expected severity CRITICAL, got %s", inc.Severity)
		}
	})

	t.Run("CreateIncident New Case", func(t *testing.T) {
		inc := service.CreateIncident("Lateral Movement Attempt", "Unusual SMB login", "HIGH", "P2", "Analyst-B", []string{"192.168.1.110"})
		if inc.ID == "" {
			t.Error("Expected valid incident ID")
		}
		if inc.Status != "NEW" {
			t.Errorf("Expected status NEW, got %s", inc.Status)
		}
	})

	t.Run("AddEvidence to Incident", func(t *testing.T) {
		ev, ok := service.AddEvidence("INC-2026-8001", "DPI Engine", "PACKET", "DNS Query Payload", "Query: malicious.net", "192.168.1.105")
		if !ok {
			t.Fatal("Failed to add evidence to INC-2026-8001")
		}
		if ev.ID == "" {
			t.Error("Expected evidence ID to be generated")
		}
	})

	t.Run("AssignAnalyst and Transition Status", func(t *testing.T) {
		ok := service.AssignAnalyst("INC-2026-8001", "Ayush", "Lead Specialist")
		if !ok {
			t.Error("Failed to assign analyst to INC-2026-8001")
		}
	})

	t.Run("CloseIncident Case Resolution", func(t *testing.T) {
		ok := service.CloseIncident("INC-2026-8002", "Isolated target host and revoked compromised SSH key.")
		if !ok {
			t.Error("Failed to close INC-2026-8002")
		}
		inc, _ := service.GetIncidentByID("INC-2026-8002")
		if inc.Status != "CLOSED" {
			t.Errorf("Expected status CLOSED, got %s", inc.Status)
		}
	})
}
