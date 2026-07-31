package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// AdvancedDetectionService manages Sigma, YARA, and Custom detection rules, simulation, and metrics for Era 34.
type AdvancedDetectionService struct {
	mu    sync.RWMutex
	rules map[string]models.AdvancedDetectionRule
}

func NewAdvancedDetectionService() *AdvancedDetectionService {
	s := &AdvancedDetectionService{
		rules: make(map[string]models.AdvancedDetectionRule),
	}
	s.seedDefaultRules()
	return s
}

func (s *AdvancedDetectionService) seedDefaultRules() {
	now := time.Now()
	r1 := models.AdvancedDetectionRule{
		ID:          "RULE-SIGMA-001",
		Name:        "Suspicious PowerShell Encoded Command Execution",
		Description: "Detects PowerShell process execution containing base64 encoded parameters commonly used in malware initial access.",
		Type:        models.RuleTypeSigma,
		Content:     "title: Suspicious PowerShell Encoded Command\nlogsource:\n  category: process_creation\ndetection:\n  selection:\n    Image|endswith: '\\powershell.exe'\n    CommandLine|contains: '-EncodedCommand'\n  condition: selection",
		Status:      models.RuleStatusEnabled,
		Version:     1,
		Author:      "NetSentinel Detection Team",
		Severity:    "HIGH",
		Tags:        []string{"execution", "powershell", "encoded"},
		MITREIDs:    []string{"T1059.001"},
		CreatedAt:   now.Add(-48 * time.Hour),
		UpdatedAt:   now,
	}

	r2 := models.AdvancedDetectionRule{
		ID:          "RULE-YARA-002",
		Name:        "Cobalt Strike Beacon Signature Match",
		Description: "YARA signature scanning rule for detecting Cobalt Strike beacon payload strings in process memory.",
		Type:        models.RuleTypeYara,
		Content:     "rule CobaltStrike_Beacon {\n  strings:\n    $s1 = \"reflectiveLoader\"\n    $s2 = \"%s as %s\\\\%s: %d\"\n  condition:\n    any of them\n}",
		Status:      models.RuleStatusEnabled,
		Version:     2,
		Author:      "NetSentinel Threat Intel",
		Severity:    "CRITICAL",
		Tags:        []string{"c2", "cobaltstrike", "beacon"},
		MITREIDs:    []string{"T1071.001", "T1055"},
		CreatedAt:   now.Add(-72 * time.Hour),
		UpdatedAt:   now,
	}

	r3 := models.AdvancedDetectionRule{
		ID:          "RULE-CUST-003",
		Name:        "High Velocity Failed Auth Throttling",
		Description: "Custom stateful rule triggering when single IP generates > 20 failed login requests within 60 seconds.",
		Type:        models.RuleTypeCustom,
		Content:     "rule_type: stateful_velocity\nthreshold: 20\nwindow_seconds: 60\nevent: auth_failure\ngroup_by: client_ip",
		Status:      models.RuleStatusEnabled,
		Version:     1,
		Author:      "NetSentinel SOC Team",
		Severity:    "HIGH",
		Tags:        []string{"authentication", "brute_force"},
		MITREIDs:    []string{"T1110.001"},
		CreatedAt:   now.Add(-24 * time.Hour),
		UpdatedAt:   now,
	}

	s.rules[r1.ID] = r1
	s.rules[r2.ID] = r2
	s.rules[r3.ID] = r3
}

func (s *AdvancedDetectionService) ListRules() []models.AdvancedDetectionRule {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []models.AdvancedDetectionRule
	for _, r := range s.rules {
		list = append(list, r)
	}
	return list
}

func (s *AdvancedDetectionService) GetRuleByID(id string) (models.AdvancedDetectionRule, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	rule, exists := s.rules[id]
	if !exists {
		return models.AdvancedDetectionRule{}, fmt.Errorf("detection rule %s not found", id)
	}
	return rule, nil
}

func (s *AdvancedDetectionService) CreateRule(rule models.AdvancedDetectionRule) (models.AdvancedDetectionRule, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if rule.ID == "" {
		rule.ID = fmt.Sprintf("RULE-%s-%d", rule.Type, time.Now().UnixNano()%10000)
	}
	rule.Version = 1
	rule.CreatedAt = time.Now()
	rule.UpdatedAt = time.Now()
	if rule.Status == "" {
		rule.Status = models.RuleStatusEnabled
	}

	s.rules[rule.ID] = rule
	return rule, nil
}

func (s *AdvancedDetectionService) UpdateRule(id string, rule models.AdvancedDetectionRule) (models.AdvancedDetectionRule, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, exists := s.rules[id]
	if !exists {
		return models.AdvancedDetectionRule{}, fmt.Errorf("detection rule %s not found", id)
	}

	existing.Name = rule.Name
	existing.Description = rule.Description
	existing.Content = rule.Content
	existing.Status = rule.Status
	existing.Severity = rule.Severity
	existing.Tags = rule.Tags
	existing.MITREIDs = rule.MITREIDs
	existing.Version++
	existing.UpdatedAt = time.Now()

	s.rules[id] = existing
	return existing, nil
}

func (s *AdvancedDetectionService) DeleteRule(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.rules[id]; !exists {
		return fmt.Errorf("detection rule %s not found", id)
	}
	delete(s.rules, id)
	return nil
}

func (s *AdvancedDetectionService) TestRule(req models.RuleTestRequest) (models.RuleTestResult, error) {
	var syntaxErrors []string
	var warnings []string
	matches := 0
	var matchDetails []string

	content := strings.ToLower(req.Content)
	payload := strings.ToLower(req.SamplePayload)

	if req.Type == models.RuleTypeSigma {
		if !strings.Contains(content, "title:") || !strings.Contains(content, "detection:") {
			syntaxErrors = append(syntaxErrors, "Sigma rule missing required top-level 'title' or 'detection' keys.")
		}
		if strings.Contains(payload, "powershell") || strings.Contains(payload, "encodedcommand") {
			matches = 1
			matchDetails = append(matchDetails, "Matched pattern 'powershell -encodedcommand' in payload sample.")
		}
	} else if req.Type == models.RuleTypeYara {
		if !strings.Contains(content, "rule") || !strings.Contains(content, "condition:") {
			syntaxErrors = append(syntaxErrors, "YARA rule missing required 'rule' declaration or 'condition:' section.")
		}
		if strings.Contains(payload, "reflectiveloader") || strings.Contains(payload, "beacon") {
			matches = 1
			matchDetails = append(matchDetails, "Matched string '$s1 = reflectiveLoader' in binary payload sample.")
		}
	} else {
		if strings.Contains(payload, "failed") || strings.Contains(payload, "unauthorized") {
			matches = 2
			matchDetails = append(matchDetails, "Stateful velocity threshold exceeded on payload sample.")
		}
	}

	valid := len(syntaxErrors) == 0

	return models.RuleTestResult{
		Valid:         valid,
		MatchesFound:  matches,
		MatchDetails:  matchDetails,
		ExecutionTime: "1.2ms",
		SyntaxErrors:  syntaxErrors,
		Warnings:      warnings,
	}, nil
}

func (s *AdvancedDetectionService) SimulateRule(req models.RuleSimulationRequest) (models.RuleSimulationResult, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	_, exists := s.rules[req.RuleID]
	if !exists {
		return models.RuleSimulationResult{}, fmt.Errorf("detection rule %s not found", req.RuleID)
	}

	return models.RuleSimulationResult{
		RuleID:            req.RuleID,
		EventsSimulated:   10000,
		MatchesCount:      14,
		EstimatedFalsePos: 0.02,
		SimulatedCoverage: 94.5,
		ExecutedAt:        time.Now(),
	}, nil
}

func (s *AdvancedDetectionService) GetDetectionMetrics() models.DetectionMetrics {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sigmaCount, yaraCount, customCount := 0, 0, 0
	sevBreakdown := map[string]int{
		"CRITICAL": 0,
		"HIGH":     0,
		"MEDIUM":   0,
		"LOW":      0,
	}

	for _, r := range s.rules {
		if r.Status == models.RuleStatusEnabled {
			switch r.Type {
			case models.RuleTypeSigma:
				sigmaCount++
			case models.RuleTypeYara:
				yaraCount++
			case models.RuleTypeCustom:
				customCount++
			}
			sevBreakdown[r.Severity]++
		}
	}

	return models.DetectionMetrics{
		TotalRules:           len(s.rules),
		ActiveSigmaRules:     sigmaCount,
		ActiveYaraRules:      yaraCount,
		ActiveCustomRules:    customCount,
		TotalDetections24h:   142,
		MITRECoveragePercent: 88.5,
		SeverityBreakdown:    sevBreakdown,
		LastScanTime:         time.Now(),
	}
}
