package services

import (
	"strings"
	"testing"
)

func TestMITREService(t *testing.T) {
	service := NewMITREService()

	t.Run("GetMatrix Returns All 12 Tactics", func(t *testing.T) {
		matrix := service.GetMatrix()
		if len(matrix) != 12 {
			t.Fatalf("Expected 12 tactic groups, got %d", len(matrix))
		}
	})

	t.Run("GetTechniqueByID Valid Technique", func(t *testing.T) {
		tech, exists := service.GetTechniqueByID("T1071")
		if !exists {
			t.Fatal("Expected T1071 to exist in MITRE knowledge base")
		}

		if !strings.Contains(tech.Name, "Application Layer Protocol") {
			t.Errorf("Expected technique name to contain 'Application Layer Protocol', got %q", tech.Name)
		}

		if tech.Tactic != "Command & Control" {
			t.Errorf("Expected tactic Command & Control, got %q", tech.Tactic)
		}
	})

	t.Run("SearchTechniques Keyword Query", func(t *testing.T) {
		results := service.SearchTechniques("DNS")
		if len(results) == 0 {
			t.Fatal("Expected search results for keyword 'DNS'")
		}
	})

	t.Run("GetStatistics Structure", func(t *testing.T) {
		stats := service.GetStatistics()
		if stats.TotalTechniquesMapped == 0 {
			t.Error("Expected TotalTechniquesMapped > 0")
		}
		if stats.ActiveTacticsCount != 12 {
			t.Errorf("Expected ActiveTacticsCount 12, got %d", stats.ActiveTacticsCount)
		}
	})

	t.Run("GetHeatMap Structure", func(t *testing.T) {
		heatmap := service.GetHeatMap()
		if len(heatmap.MostTriggeredTechniques) == 0 {
			t.Error("Expected non-empty MostTriggeredTechniques in heat map")
		}
	})

	t.Run("ExplainTechnique Valid ID", func(t *testing.T) {
		explanation, mitigation, exists := service.ExplainTechnique("T1048.003")
		if !exists {
			t.Fatal("Expected explanation for T1048.003")
		}

		if !strings.Contains(explanation, "Exfiltration Over Alternative Protocol") {
			t.Errorf("Expected explanation to reference T1048.003, got %q", explanation)
		}

		if mitigation == "" {
			t.Error("Expected mitigation guidance text")
		}
	})
}
