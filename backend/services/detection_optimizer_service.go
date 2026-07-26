package services

import (
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type DetectionOptimizerService struct {
	mu              sync.RWMutex
	performances    map[string]models.RulePerformance
	recommendations map[string]models.OptimizationRecommendation
	gaps            map[string]models.DetectionGap
	feedbacks       []models.FeedbackRecord
}

func NewDetectionOptimizerService() *DetectionOptimizerService {
	s := &DetectionOptimizerService{
		performances:    make(map[string]models.RulePerformance),
		recommendations: make(map[string]models.OptimizationRecommendation),
		gaps:            make(map[string]models.DetectionGap),
		feedbacks:       make([]models.FeedbackRecord, 0),
	}
	s.seedOptimizerData()
	return s
}

func (s *DetectionOptimizerService) seedOptimizerData() {
	p1 := models.RulePerformance{
		RuleID:              "RULE-SIGMA-001",
		RuleName:            "High Entropy DNS Tunneling Detection",
		RuleType:            "SIGMA",
		ExecutionsCount:     1420,
		TruePositivesCount:  28,
		FalsePositivesCount: 1,
		FalsePositiveRate:   0.034,
		PerformanceScore:    94,
		SeverityAccuracy:    0.96,
		MITRECoverageScore:  0.95,
		AvgResponseTimeMs:   0.12,
		LastAnalyzed:        time.Now().Add(-10 * time.Minute),
	}

	p2 := models.RulePerformance{
		RuleID:              "RULE-YARA-002",
		RuleName:            "SSH Port Brute Force Sequence",
		RuleType:            "YARA",
		ExecutionsCount:     3200,
		TruePositivesCount:  43,
		FalsePositivesCount: 2,
		FalsePositiveRate:   0.044,
		PerformanceScore:    91,
		SeverityAccuracy:    0.92,
		MITRECoverageScore:  0.90,
		AvgResponseTimeMs:   0.18,
		LastAnalyzed:        time.Now().Add(-15 * time.Minute),
	}

	p3 := models.RulePerformance{
		RuleID:              "RULE-SIGMA-003",
		RuleName:            "Powershell Encoded Payload Execution",
		RuleType:            "SIGMA",
		ExecutionsCount:     850,
		TruePositivesCount:  10,
		FalsePositivesCount: 4,
		FalsePositiveRate:   0.285,
		PerformanceScore:    72,
		SeverityAccuracy:    0.78,
		MITRECoverageScore:  0.85,
		AvgResponseTimeMs:   0.15,
		LastAnalyzed:        time.Now().Add(-30 * time.Minute),
	}

	rec1 := models.OptimizationRecommendation{
		ID:              "REC-2026-001",
		RuleID:          "RULE-SIGMA-003",
		RuleName:        "Powershell Encoded Payload Execution",
		Category:        "Asset Exclusion",
		Title:           "Exclude Trusted Administrative Subnet / Host 10.0.0.5",
		Description:     "Internal IT management server 10.0.0.5 executes encoded PowerShell scripts for routine system administration causing 4 false positive triggers daily.",
		CurrentState:    "Rule evaluates all hosts without ip exclusion filter.",
		SuggestedChange: "Add condition: not (src_ip == '10.0.0.5' and user == 'SYSTEM_ADMIN')",
		ExpectedImpact:  "Reduces rule false positive rate by 85% and improves performance score from 72 to 94.",
		ConfidenceScore: 0.95,
		Status:          "PENDING",
		CreatedAt:       time.Now().Add(-1 * time.Hour),
	}

	rec2 := models.OptimizationRecommendation{
		ID:              "REC-2026-002",
		RuleID:          "RULE-SIGMA-001",
		RuleName:        "High Entropy DNS Tunneling Detection",
		Category:        "Threshold Adjustment",
		Title:           "Increase Subdomain Entropy Threshold from 4.2 to 4.5",
		Description:     "CDN domain resolution requests occasionally trigger low-confidence alerts at 4.2 entropy.",
		CurrentState:    "entropy() > 4.2",
		SuggestedChange: "entropy() > 4.5 and query_type == 'TXT'",
		ExpectedImpact:  "Eliminates CDN false positives while preserving 100% C2 beacon detection accuracy.",
		ConfidenceScore: 0.92,
		Status:          "PENDING",
		CreatedAt:       time.Now().Add(-2 * time.Hour),
	}

	gap1 := models.DetectionGap{
		ID:                    "GAP-MITRE-T1003",
		MITRETechnique:        "T1003 - OS Credential Dumping",
		MITRETactic:           "Credential Access",
		GapTitle:              "Uncovered LSASS Memory Read Attempt",
		RiskSeverity:          "CRITICAL",
		ObservedAttackPattern: "Host 192.168.1.105 demonstrated abnormal process memory access targeting lsass.exe process.",
		RecommendedRuleLogic: `title: LSASS Process Memory Dump Access
logsource:
    category: process_access
detection:
    selection:
        TargetImage|endswith: '\lsass.exe'
        GrantedAccess: '0x1010'
    condition: selection`,
	}

	gap2 := models.DetectionGap{
		ID:                    "GAP-MITRE-T1068",
		MITRETechnique:        "T1068 - Exploitation for Privilege Escalation",
		MITRETactic:           "Privilege Escalation",
		GapTitle:              "Kernel Memory Exploitation Sequence",
		RiskSeverity:          "HIGH",
		ObservedAttackPattern: "Unusual ring-0 kernel token manipulation observed during localized process execution.",
		RecommendedRuleLogic: `title: Kernel Privilege Escalation Vulnerability
detection:
    selection:
        EventID: 4688
        ParentImage|endswith: '\services.exe'
        TokenElevationType: 2
    condition: selection`,
	}

	s.performances[p1.RuleID] = p1
	s.performances[p2.RuleID] = p2
	s.performances[p3.RuleID] = p3

	s.recommendations[rec1.ID] = rec1
	s.recommendations[rec2.ID] = rec2

	s.gaps[gap1.ID] = gap1
	s.gaps[gap2.ID] = gap2
}

func (s *DetectionOptimizerService) GetOverview() models.OptimizerOverview {
	s.mu.RLock()
	defer s.mu.RUnlock()

	totalScore := 0
	healthDist := map[string]int{
		"OPTIMAL":      0,
		"NEEDS_TUNING": 0,
		"POOR":         0,
	}

	for _, p := range s.performances {
		totalScore += p.PerformanceScore
		if p.PerformanceScore >= 90 {
			healthDist["OPTIMAL"]++
		} else if p.PerformanceScore >= 70 {
			healthDist["NEEDS_TUNING"]++
		} else {
			healthDist["POOR"]++
		}
	}

	avgScore := 85
	if len(s.performances) > 0 {
		avgScore = totalScore / len(s.performances)
	}

	var topRecs []models.OptimizationRecommendation
	for _, r := range s.recommendations {
		topRecs = append(topRecs, r)
	}

	return models.OptimizerOverview{
		TotalRulesAnalyzed:       len(s.performances),
		AvgPerformanceScore:      avgScore,
		OverallFalsePositiveRate: 0.032,
		TotalGapsIdentified:      len(s.gaps),
		RecommendationsCount:     len(s.recommendations),
		HealthDistribution:       healthDist,
		TopRecommendations:       topRecs,
	}
}

func (s *DetectionOptimizerService) GetRulePerformances() []models.RulePerformance {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.RulePerformance
	for _, p := range s.performances {
		result = append(result, p)
	}
	return result
}

func (s *DetectionOptimizerService) GetRecommendations() []models.OptimizationRecommendation {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.OptimizationRecommendation
	for _, r := range s.recommendations {
		result = append(result, r)
	}
	return result
}

func (s *DetectionOptimizerService) GetDetectionGaps() []models.DetectionGap {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.DetectionGap
	for _, g := range s.gaps {
		result = append(result, g)
	}
	return result
}

func (s *DetectionOptimizerService) RecordFeedback(fb models.FeedbackRecord) models.FeedbackRecord {
	s.mu.Lock()
	defer s.mu.Unlock()

	if fb.ID == "" {
		fb.ID = fmt.Sprintf("FB-%d", time.Now().Unix()%100000)
	}
	fb.CreatedAt = time.Now()
	s.feedbacks = append(s.feedbacks, fb)

	// Adjust rule performance score based on feedback
	if perf, exists := s.performances[fb.RuleID]; exists {
		if fb.AnalystVerdict == "FALSE_POSITIVE" {
			perf.FalsePositivesCount++
			perf.FalsePositiveRate = float64(perf.FalsePositivesCount) / float64(perf.ExecutionsCount)
			perf.PerformanceScore = max(50, perf.PerformanceScore-5)
		} else if fb.AnalystVerdict == "TRUE_POSITIVE" {
			perf.TruePositivesCount++
			perf.PerformanceScore = min(100, perf.PerformanceScore+2)
		}
		perf.LastAnalyzed = time.Now()
		s.performances[fb.RuleID] = perf
	}

	return fb
}

func (s *DetectionOptimizerService) AnalyzeRule(ruleID string) (models.RulePerformance, []models.OptimizationRecommendation) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	perf, exists := s.performances[ruleID]
	if !exists {
		perf = models.RulePerformance{
			RuleID:            ruleID,
			RuleName:          "Custom Target Rule",
			RuleType:          "SIGMA",
			PerformanceScore:  88,
			FalsePositiveRate: 0.02,
			LastAnalyzed:      time.Now(),
		}
	}

	var recs []models.OptimizationRecommendation
	for _, r := range s.recommendations {
		if r.RuleID == ruleID || ruleID == "" {
			recs = append(recs, r)
		}
	}

	return perf, recs
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
