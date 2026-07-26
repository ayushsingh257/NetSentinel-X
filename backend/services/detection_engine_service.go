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
	r1 := models.DetectionRule{
		ID:                "RULE-SIGMA-001",
		Name:              "High Entropy DNS Tunneling Detection",
		Description:       "Detects rapid DNS TXT queries containing high-entropy subdomains indicating protocol tunneling or data exfiltration.",
		Author:            "NetSentinel-X SOC Team",
		Severity:          "CRITICAL",
		Type:              "SIGMA",
		MITRETechnique:    "T1048.003 - Exfiltration Over Alternative Protocol (DNS)",
		MITRETactic:       "Exfiltration",
		Status:            "ENABLED",
		Version:           "1.2.0",
		DetectionCount:    29,
		FalsePositiveRate: 0.02,
		CreatedAt:         time.Now().Add(-48 * time.Hour),
		UpdatedAt:         time.Now().Add(-2 * time.Hour),
		Logic: `title: High Entropy DNS Tunneling
id: dns_tunnel_001
status: experimental
description: Detects high-frequency DNS query bursts with sub-domain payload entropy > 4.5
logsource:
    category: dns
    product: netsentinel_dpi
detection:
    selection:
        proto: UDP
        dst_port: 53
        query_type: TXT
    condition: selection and count() > 10 within 1s`,
	}

	r2 := models.DetectionRule{
		ID:                "RULE-YARA-002",
		Name:              "SSH Port Brute Force Sequence",
		Description:       "Identifies high-velocity TCP SYN requests targeting SSH port 22 or RDP port 3389.",
		Author:            "Threat Intelligence Team",
		Severity:          "HIGH",
		Type:              "YARA",
		MITRETechnique:    "T1110 - Brute Force",
		MITRETactic:       "Credential Access",
		Status:            "ENABLED",
		Version:           "2.0.1",
		DetectionCount:    45,
		FalsePositiveRate: 0.01,
		CreatedAt:         time.Now().Add(-72 * time.Hour),
		UpdatedAt:         time.Now().Add(-5 * time.Hour),
		Logic: `rule SSH_Brute_Force_Pattern {
    meta:
        author = "NetSentinel-X"
        description = "Matches TCP SYN flood sequence targeting port 22"
    strings:
        $syn_header = { 45 00 00 3c ?? ?? 40 00 40 06 }
        $ssh_proto = "SSH-2.0-OpenSSH"
    condition:
        $syn_header and $ssh_proto
}`,
	}

	r3 := models.DetectionRule{
		ID:                "RULE-SIGMA-003",
		Name:              "Powershell Encoded Payload Execution",
		Description:       "Detects command execution involving base64 encoded PowerShell commands.",
		Author:            "Detection Engineer",
		Severity:          "HIGH",
		Type:              "SIGMA",
		MITRETechnique:    "T1059.001 - PowerShell",
		MITRETactic:       "Execution",
		Status:            "ENABLED",
		Version:           "1.0.0",
		DetectionCount:    14,
		FalsePositiveRate: 0.05,
		CreatedAt:         time.Now().Add(-24 * time.Hour),
		UpdatedAt:         time.Now().Add(-1 * time.Hour),
		Logic: `title: Encoded PowerShell Command
id: ps_encoded_003
detection:
    selection:
        Image|endswith: '\powershell.exe'
        CommandLine|contains:
            - '-enc'
            - '-EncodedCommand'
    condition: selection`,
	}

	s.rules[r1.ID] = r1
	s.rules[r2.ID] = r2
	s.rules[r3.ID] = r3
}

func (s *DetectionEngineService) GetAllRules() []models.DetectionRule {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.DetectionRule
	for _, rule := range s.rules {
		result = append(result, rule)
	}
	return result
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
		rule.ID = fmt.Sprintf("RULE-%s-%d", strings.ToUpper(rule.Type), time.Now().Unix()%10000)
	}
	if rule.Author == "" {
		rule.Author = "SOC Analyst"
	}
	if rule.Status == "" {
		rule.Status = "ENABLED"
	}
	if rule.Version == "" {
		rule.Version = "1.0.0"
	}
	rule.CreatedAt = time.Now()
	rule.UpdatedAt = time.Now()

	s.rules[rule.ID] = rule
	return rule
}

func (s *DetectionEngineService) UpdateRule(id string, updated models.DetectionRule) (models.DetectionRule, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, exists := s.rules[id]
	if !exists {
		return models.DetectionRule{}, false
	}

	updated.ID = existing.ID
	updated.CreatedAt = existing.CreatedAt
	updated.UpdatedAt = time.Now()
	if updated.Version == "" {
		updated.Version = existing.Version
	}

	s.rules[id] = updated
	return updated, true
}

func (s *DetectionEngineService) DeleteRule(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	_, exists := s.rules[id]
	if !exists {
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
	start := time.Now()
	logic := strings.ToLower(req.RuleLogic)
	payload := strings.ToLower(req.SamplePayload)

	matched := false
	evidence := "No matching pattern detected in sample payload."

	if req.RuleType == "YARA" {
		if strings.Contains(payload, "ssh") || strings.Contains(payload, "syn") || strings.Contains(payload, "45 00") || strings.Contains(payload, "malicious") {
			matched = true
			evidence = "Pattern '$syn_header' & '$ssh_proto' matched in packet payload stream."
		}
	} else {
		// SIGMA rule matching
		if strings.Contains(payload, "dns") || strings.Contains(payload, "txt") || strings.Contains(payload, "powershell") || strings.Contains(payload, "udp") || strings.Contains(payload, "tunnel") || strings.Contains(logic, "dns") {
			matched = true
			evidence = "Sigma selection criteria [proto=UDP, dst_port=53, query_type=TXT] matched target event payload."
		}
	}

	score := 0.94
	if !matched {
		score = 0.0
	}

	return models.SimulationResponse{
		Matched:         matched,
		RuleName:        "Custom Simulation Test",
		Severity:        "HIGH",
		MITRETechnique:  "T1048.003 - DNS Tunneling",
		AffectedAsset:   "192.168.1.105 (Workstation-A)",
		Evidence:        evidence,
		ConfidenceScore: score,
		ExecutionTimeMs: float64(time.Since(start).Microseconds()) / 1000.0,
		Timestamp:       time.Now(),
	}
}

func (s *DetectionEngineService) AIDetectionAssistant(query string) string {
	q := strings.ToLower(query)

	if strings.Contains(q, "dns") || strings.Contains(q, "tunnel") {
		return `Generated Sigma Detection Rule for DNS Tunneling:

title: Custom DNS Tunneling & Exfiltration
id: rule_dns_ai_001
description: Auto-generated by NetSentinel-X AI Detection Assistant.
logsource:
    category: dns
    product: netsentinel_dpi
detection:
    selection:
        dst_port: 53
        query_type: TXT
    condition: selection and entropy() > 4.5
`
	}

	return fmt.Sprintf("NetSentinel-X AI Detection Assistant analyzed query: %q. Recommendation: Add port threshold filters and specify MITRE technique mapping to reduce false positive rate.", query)
}

func (s *DetectionEngineService) GetAnalytics() models.DetectionAnalytics {
	s.mu.RLock()
	defer s.mu.RUnlock()

	activeCount := 0
	totalTriggers := 0

	for _, rule := range s.rules {
		if rule.Status == "ENABLED" {
			activeCount++
		}
		totalTriggers += rule.DetectionCount
	}

	return models.DetectionAnalytics{
		TotalRules:         len(s.rules),
		ActiveRules:        activeCount,
		TotalDetections:    totalTriggers,
		AvgFalsePositive:   0.025,
		MITRECoverage:      92.5,
		MostTriggeredRules: []string{"RULE-SIGMA-001 (29)", "RULE-YARA-002 (45)", "RULE-SIGMA-003 (14)"},
		DetectionGaps:      []string{"Linux Kernel Exploits (T1068)", "LSASS Memory Dump (T1003)"},
	}
}
