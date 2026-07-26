package services

import (
	"testing"

	"netsentinel-x-backend/models"
)

func TestDetectionEngineService(t *testing.T) {
	service := NewDetectionEngineService()

	t.Run("GetAllRules Returns Seed Rules", func(t *testing.T) {
		rules := service.GetAllRules()
		if len(rules) < 3 {
			t.Fatalf("Expected at least 3 default rules, got %d", len(rules))
		}
	})

	t.Run("Create and Retrieve Rule", func(t *testing.T) {
		newRule := models.DetectionRule{
			Name:           "Test Custom Rule",
			Description:    "Test Rule Description",
			Severity:       "HIGH",
			Type:           "SIGMA",
			MITRETechnique: "T1071",
			Logic:          "selection: dst_port: 80",
		}

		created := service.CreateRule(newRule)
		if created.ID == "" {
			t.Fatal("Expected generated rule ID")
		}

		retrieved, exists := service.GetRuleByID(created.ID)
		if !exists || retrieved.Name != "Test Custom Rule" {
			t.Errorf("Expected to retrieve rule 'Test Custom Rule'")
		}
	})

	t.Run("Toggle Rule Status", func(t *testing.T) {
		rule, exists := service.ToggleRuleStatus("RULE-SIGMA-001")
		if !exists {
			t.Fatal("Expected RULE-SIGMA-001 to exist")
		}
		if rule.Status != "DISABLED" {
			t.Errorf("Expected status DISABLED after toggle, got %s", rule.Status)
		}
	})

	t.Run("Run Simulation Engine", func(t *testing.T) {
		simRes := service.RunSimulation(models.SimulationRequest{
			RuleType:      "SIGMA",
			RuleLogic:     "proto: UDP dst_port: 53",
			SamplePayload: "Captured UDP DNS query on port 53 for malicious-tunnel.org",
		})

		if !simRes.Matched {
			t.Error("Expected simulation to match DNS sample payload")
		}

		if simRes.ConfidenceScore <= 0 {
			t.Errorf("Expected confidence score > 0, got %f", simRes.ConfidenceScore)
		}
	})

	t.Run("AI Detection Assistant Recommendation", func(t *testing.T) {
		aiResp := service.AIDetectionAssistant("Create a rule for DNS tunneling")
		if aiResp == "" {
			t.Error("Expected AI response string")
		}
	})

	t.Run("Get Analytics Structure", func(t *testing.T) {
		analytics := service.GetAnalytics()
		if analytics.TotalRules == 0 {
			t.Error("Expected TotalRules > 0")
		}
	})
}
