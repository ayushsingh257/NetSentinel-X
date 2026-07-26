package services

import (
	"testing"
)

func TestHistoricalInvestigationService(t *testing.T) {
	service := NewHistoricalInvestigationService()

	t.Run("GetAllEvents Returns Seed Events", func(t *testing.T) {
		events := service.GetAllEvents()
		if len(events) < 5 {
			t.Fatalf("Expected at least 5 historical events, got %d", len(events))
		}
	})

	t.Run("SearchEvents By Source IP", func(t *testing.T) {
		results := service.SearchEvents("185.220.101.45")
		if len(results) < 1 {
			t.Error("Expected at least 1 result for IP search")
		}
	})

	t.Run("SearchEvents By Event Type", func(t *testing.T) {
		results := service.SearchEvents("ALERT")
		if len(results) < 1 {
			t.Error("Expected at least 1 result for ALERT type search")
		}
	})

	t.Run("GetIOCHistory Known IOC", func(t *testing.T) {
		ioc, exists := service.GetIOCHistory("185.220.101.45")
		if !exists {
			t.Fatal("Expected IOC history for 185.220.101.45 to exist")
		}
		if ioc.TotalOccurrences < 1 {
			t.Error("Expected non-zero occurrences count")
		}
	})

	t.Run("GetReplaySequence Returns Steps", func(t *testing.T) {
		steps := service.GetReplaySequence("INC-2026-8001")
		if len(steps) < 4 {
			t.Fatalf("Expected at least 4 replay steps, got %d", len(steps))
		}
		if steps[0].StepIndex != 1 {
			t.Error("Expected replay sequence to start at step 1")
		}
	})

	t.Run("RunThreatHuntQuery DNS Tunneling", func(t *testing.T) {
		result := service.RunThreatHuntQuery("dns tunneling")
		if result.ConfidenceScore < 80 {
			t.Errorf("Expected confidence >= 80, got %d", result.ConfidenceScore)
		}
		if len(result.InvestigationSteps) < 3 {
			t.Error("Expected at least 3 investigation steps")
		}
	})
}
