package models

import "time"

type RulePerformance struct {
	RuleID              string    `json:"rule_id"`
	RuleName            string    `json:"rule_name"`
	RuleType            string    `json:"rule_type"`
	ExecutionsCount     int       `json:"executions_count"`
	TruePositivesCount  int       `json:"true_positives_count"`
	FalsePositivesCount int       `json:"false_positives_count"`
	FalsePositiveRate   float64   `json:"false_positive_rate"`
	PerformanceScore    int       `json:"performance_score"` // 0-100
	SeverityAccuracy    float64   `json:"severity_accuracy"`
	MITRECoverageScore  float64   `json:"mitre_coverage_score"`
	AvgResponseTimeMs   float64   `json:"avg_response_time_ms"`
	LastAnalyzed        time.Time `json:"last_analyzed"`
}

type OptimizationRecommendation struct {
	ID              string    `json:"id"`
	RuleID          string    `json:"rule_id"`
	RuleName        string    `json:"rule_name"`
	Category        string    `json:"category"` // "Threshold Adjustment", "Asset Exclusion", "Logic Modification", "Severity Tuning"
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	CurrentState    string    `json:"current_state"`
	SuggestedChange string    `json:"suggested_change"`
	ExpectedImpact  string    `json:"expected_impact"`
	ConfidenceScore float64   `json:"confidence_score"`
	Status          string    `json:"status"` // "PENDING", "APPLIED", "DISMISSED"
	CreatedAt       time.Time `json:"created_at"`
}

type DetectionGap struct {
	ID                    string `json:"id"`
	MITRETechnique        string `json:"mitre_technique"`
	MITRETactic           string `json:"mitre_tactic"`
	GapTitle              string `json:"gap_title"`
	RiskSeverity          string `json:"risk_severity"`
	ObservedAttackPattern string `json:"observed_attack_pattern"`
	RecommendedRuleLogic  string `json:"recommended_rule_logic"`
}

type FeedbackRecord struct {
	ID             string    `json:"id"`
	AlertID        string    `json:"alert_id"`
	RuleID         string    `json:"rule_id"`
	AnalystVerdict string    `json:"analyst_verdict"` // "TRUE_POSITIVE", "FALSE_POSITIVE", "BENIGN", "NEEDS_REVIEW"
	Notes          string    `json:"notes"`
	SubmittedBy    string    `json:"submitted_by"`
	CreatedAt      time.Time `json:"created_at"`
}

type OptimizerOverview struct {
	TotalRulesAnalyzed       int                          `json:"total_rules_analyzed"`
	AvgPerformanceScore      int                          `json:"avg_performance_score"`
	OverallFalsePositiveRate float64                      `json:"overall_false_positive_rate"`
	TotalGapsIdentified      int                          `json:"total_gaps_identified"`
	RecommendationsCount     int                          `json:"recommendations_count"`
	HealthDistribution       map[string]int               `json:"health_distribution"`
	TopRecommendations       []OptimizationRecommendation `json:"top_recommendations"`
}
