package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type DetectionEngineService struct {
	mu    sync.RWMutex
	rules map[string]models.DetectionRule
}

func NewDetectionEngineService() *DetectionEngineService {
	s := &DetectionEngineService{
		rules: make(map[string]models.DetectionRule),
	}
	s.seedDefaultRules()
	return s
}

func (s *DetectionEngineService) seedDefaultRules() {
	now := time.Now()
	r1 := models.DetectionRule{
		ID:                "RULE-SIGMA-001",
		Name:              "Suspicious PowerShell Encoded Command Execution",
		Description:       "Detects PowerShell execution with base64 encoded payload",
		Author:            "NetSentinel SOC",
		Severity:          "HIGH",
		Type:              "SIGMA",
		MITRETechnique:    "T1059.001",
		MITRETactic:       "Execution",
		Logic:             "title: Encoded PS\ndetection:\n  selection:\n    CommandLine: '-EncodedCommand'\n  condition: selection",
		Status:            "ENABLED",
		Version:           "1.0",
		DetectionCount:    42,
		FalsePositiveRate: 0.02,
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	r2 := models.DetectionRule{
		ID:                "RULE-YARA-002",
		Name:              "Cobalt Strike Beacon Signature",
		Description:       "Matches Cobalt Strike memory beacon strings",
		Author:            "NetSentinel Intel",
		Severity:          "CRITICAL",
		Type:              "YARA",
		MITRETechnique:    "T1071.001",
		MITRETactic:       "Command and Control",
		Logic:             "rule CobaltStrike {\n  strings:\n    $s = \"reflectiveLoader\"\n  condition:\n    $s\n}",
		Status:            "ENABLED",
		Version:           "2.1",
		DetectionCount:    18,
		FalsePositiveRate: 0.01,
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	r3 := models.DetectionRule{
		ID:                "RULE-CUST-003",
		Name:              "High Velocity Failed Auth Throttling",
		Description:       "Triggers when single IP generates high failed auth attempts",
		Author:            "NetSentinel SOC Team",
		Severity:          "HIGH",
		Type:              "CUSTOM",
		MITRETechnique:    "T1110.001",
		MITRETactic:       "Credential Access",
		Logic:             "threshold: 20\nwindow_seconds: 60\nevent: auth_failure",
		Status:            "ENABLED",
		Version:           "1.0",
		DetectionCount:    84,
		FalsePositiveRate: 0.015,
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	s.rules[r1.ID] = r1
	s.rules[r2.ID] = r2
	s.rules[r3.ID] = r3
}

func (s *DetectionEngineService) GetAllRules() []models.DetectionRule {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []models.DetectionRule
	for _, r := range s.rules {
		list = append(list, r)
	}
	return list
}

func (s *DetectionEngineService) GetRuleByID(id string) (models.DetectionRule, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	rule, exists := s.rules[id]
	return rule, exists
}

func (s *DetectionEngineService) CreateRule(rule models.DetectionRule) models.DetectionRule {
	s.mu.Lock()
	defer s.mu.Unlock()

	if rule.ID == "" {
		rule.ID = fmt.Sprintf("RULE-CUSTOM-%d", time.Now().UnixNano()%10000)
	}
	rule.Status = "ENABLED"
	rule.Version = "1.0"
	rule.CreatedAt = time.Now()
	rule.UpdatedAt = time.Now()

	s.rules[rule.ID] = rule
	return rule
}

func (s *DetectionEngineService) UpdateRule(id string, rule models.DetectionRule) (models.DetectionRule, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, exists := s.rules[id]
	if !exists {
		return models.DetectionRule{}, false
	}

	existing.Name = rule.Name
	existing.Description = rule.Description
	existing.Severity = rule.Severity
	existing.Logic = rule.Logic
	existing.Status = rule.Status
	existing.UpdatedAt = time.Now()

	s.rules[id] = existing
	return existing, true
}

func (s *DetectionEngineService) DeleteRule(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.rules[id]; !exists {
		return false
	}
	delete(s.rules, id)
	return true
}

func (s *DetectionEngineService) ToggleRuleStatus(id string) (models.DetectionRule, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	rule, exists := s.rules[id]
	if !exists {
		return models.DetectionRule{}, false
	}

	if rule.Status == "ENABLED" {
		rule.Status = "DISABLED"
	} else {
		rule.Status = "ENABLED"
	}
	rule.UpdatedAt = time.Now()
	s.rules[id] = rule

	return rule, true
}

func (s *DetectionEngineService) RunSimulation(req models.SimulationRequest) models.SimulationResponse {
	matched := false
	payload := strings.ToLower(req.SamplePayload)

	if strings.Contains(payload, "powershell") || strings.Contains(payload, "encodedcommand") || strings.Contains(payload, "dns") {
		matched = true
	}

	return models.SimulationResponse{
		Matched:         matched,
		RuleName:        "Simulated Detection Rule",
		Severity:        "HIGH",
		MITRETechnique:  "T1071.001",
		AffectedAsset:   "Host-01",
		Evidence:        req.SamplePayload,
		ConfidenceScore: 0.95,
		ExecutionTimeMs: 1.2,
		Timestamp:       time.Now(),
	}
}

func (s *DetectionEngineService) GetAnalytics() models.DetectionAnalytics {
	s.mu.RLock()
	defer s.mu.RUnlock()

	activeCount := 0
	for _, r := range s.rules {
		if r.Status == "ENABLED" {
			activeCount++
		}
	}

	return models.DetectionAnalytics{
		TotalRules:         len(s.rules),
		ActiveRules:        activeCount,
		TotalDetections:    142,
		AvgFalsePositive:   0.015,
		MITRECoverage:      88.5,
		MostTriggeredRules: []string{"RULE-SIGMA-001", "RULE-YARA-002"},
		DetectionGaps:      []string{"T1055.012 (Process Injection)"},
	}
}

func (s *DetectionEngineService) AIDetectionAssistant(query string) string {
	return fmt.Sprintf("AI Recommendation for '%s': Consider creating a stateful detection rule with a 60-second velocity window.", query)
}
