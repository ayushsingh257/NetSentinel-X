package services

import (
	"strings"
	"testing"
)

func TestThreatInvestigationService(t *testing.T) {
	service := NewThreatInvestigationService()

	t.Run("GetAllInvestigations Returns Initial Seed", func(t *testing.T) {
		invs := service.GetAllInvestigations()
		if len(invs) == 0 {
			t.Fatal("Expected non-empty list of investigations")
		}
	})

	t.Run("GetInvestigationByID Valid ID", func(t *testing.T) {
		inv, exists := service.GetInvestigationByID("INV-2026-001")
		if !exists {
			t.Fatal("Expected investigation INV-2026-001 to exist")
		}

		if !strings.Contains(inv.Title, "DNS Tunneling") {
			t.Errorf("Expected title to contain 'DNS Tunneling', got %q", inv.Title)
		}

		if len(inv.Timeline) < 3 {
			t.Errorf("Expected at least 3 timeline events, got %d", len(inv.Timeline))
		}

		if len(inv.Evidence) == 0 {
			t.Error("Expected evidence records in investigation")
		}

		if inv.ConfidenceScore <= 0 {
			t.Errorf("Expected confidence score > 0, got %f", inv.ConfidenceScore)
		}
	})

	t.Run("GenerateInvestigation Creates Valid Object", func(t *testing.T) {
		targetIP := "192.168.1.180"
		inv, err := service.GenerateInvestigation(targetIP, "")
		if err != nil {
			t.Fatalf("Unexpected error generating investigation: %v", err)
		}

		if inv == nil {
			t.Fatal("Expected non-nil investigation result")
		}

		if !strings.Contains(inv.ThreatStory, targetIP) {
			t.Errorf("Expected threat story to reference IP %s", targetIP)
		}

		if len(inv.Timeline) == 0 {
			t.Error("Expected timeline events in generated investigation")
		}

		retrieved, exists := service.GetInvestigationByID(inv.ID)
		if !exists || retrieved == nil {
			t.Errorf("Expected generated investigation %s to be retrievable", inv.ID)
		}
	})
}
