package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"netsentinel-x-backend/models"
)

func TestAdvancedDetectionService(t *testing.T) {
	service := NewAdvancedDetectionService()

	// 1. List Rules
	rules := service.ListRules()
	assert.GreaterOrEqual(t, len(rules), 3)

	// 2. Get Rule by ID
	r1, err := service.GetRuleByID("RULE-SIGMA-001")
	assert.NoError(t, err)
	assert.Equal(t, "Suspicious PowerShell Encoded Command Execution", r1.Name)

	// 3. Create Custom Rule
	newRule := models.AdvancedDetectionRule{
		Name:        "Test Ransomware File Extension Monitor",
		Description: "Detects rapid creation of known ransomware extensions",
		Type:        models.RuleTypeCustom,
		Content:     "extension: [.locked, .crypto]",
		Severity:    "HIGH",
		Tags:        []string{"ransomware", "filesystem"},
	}
	created, err := service.CreateRule(newRule)
	assert.NoError(t, err)
	assert.NotEmpty(t, created.ID)
	assert.Equal(t, 1, created.Version)

	// 4. Update Rule
	created.Name = "Updated Ransomware File Extension Monitor"
	updated, err := service.UpdateRule(created.ID, created)
	assert.NoError(t, err)
	assert.Equal(t, 2, updated.Version)
	assert.Equal(t, "Updated Ransomware File Extension Monitor", updated.Name)

	// 5. Test Sigma Rule
	sigmaTest, err := service.TestRule(models.RuleTestRequest{
		Type:          models.RuleTypeSigma,
		Content:       "title: Test Sigma\ndetection:\n  selection:\n    Image: powershell.exe\n  condition: selection",
		SamplePayload: "Process execution: powershell.exe -encodedcommand abc==",
	})
	assert.NoError(t, err)
	assert.True(t, sigmaTest.Valid)
	assert.GreaterOrEqual(t, sigmaTest.MatchesFound, 1)

	// 6. Test YARA Rule
	yaraTest, err := service.TestRule(models.RuleTestRequest{
		Type:          models.RuleTypeYara,
		Content:       "rule TestYara {\n  strings:\n    $a = \"reflectiveLoader\"\n  condition:\n    $a\n}",
		SamplePayload: "Memory dump containing reflectiveLoader binary payload",
	})
	assert.NoError(t, err)
	assert.True(t, yaraTest.Valid)
	assert.GreaterOrEqual(t, yaraTest.MatchesFound, 1)

	// 7. Simulate Rule
	simRes, err := service.SimulateRule(models.RuleSimulationRequest{
		RuleID:    "RULE-SIGMA-001",
		TimeRange: "24h",
	})
	assert.NoError(t, err)
	assert.Equal(t, "RULE-SIGMA-001", simRes.RuleID)
	assert.Equal(t, 10000, simRes.EventsSimulated)

	// 8. Get Detection Metrics
	metrics := service.GetDetectionMetrics()
	assert.GreaterOrEqual(t, metrics.TotalRules, 4)
	assert.GreaterOrEqual(t, metrics.ActiveSigmaRules, 1)
	assert.GreaterOrEqual(t, metrics.ActiveYaraRules, 1)
	assert.Equal(t, 88.5, metrics.MITRECoveragePercent)

	// 9. Delete Rule
	err = service.DeleteRule(created.ID)
	assert.NoError(t, err)
}
