package services

import (
	"testing"
)

func TestReportService(t *testing.T) {
	service := NewReportService()

	t.Run("GetReports List", func(t *testing.T) {
		reports := service.GetReports()
		if len(reports) < 1 {
			t.Fatalf("Expected at least 1 report, got %d", len(reports))
		}
	})

	t.Run("GetComplianceFrameworks Structure", func(t *testing.T) {
		fwMap := service.GetComplianceFrameworks()
		if _, exists := fwMap["SOC2"]; !exists {
			t.Error("Expected SOC2 framework to exist")
		}
		if _, exists := fwMap["ISO27001"]; !exists {
			t.Error("Expected ISO27001 framework to exist")
		}
	})

	t.Run("GenerateReport Creates Valid Object", func(t *testing.T) {
		rep := service.GenerateReport("EXECUTIVE", "Monthly Executive Briefing")
		if rep.ID == "" {
			t.Error("Expected valid report ID")
		}
		if rep.SecurityScore < 90 {
			t.Errorf("Expected security score >= 90, got %d", rep.SecurityScore)
		}
	})

	t.Run("ExportReportHTML Output", func(t *testing.T) {
		html := service.ExportReportHTML("REP-2026-001")
		if len(html) < 50 {
			t.Error("Expected non-empty HTML string payload")
		}
	})
}
