package models

import "time"

type RuleType string

const (
	RuleTypeSigma  RuleType = "SIGMA"
	RuleTypeYara   RuleType = "YARA"
	RuleTypeCustom RuleType = "CUSTOM"
)

type RuleStatus string

const (
	RuleStatusEnabled  RuleStatus = "ENABLED"
	RuleStatusDisabled RuleStatus = "DISABLED"
	RuleStatusTesting  RuleStatus = "TESTING"
)

// AdvancedDetectionRule represents an enterprise detection rule entity for Era 34.
type AdvancedDetectionRule struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Type        RuleType   `json:"type"`
	Content     string     `json:"content"`
	Status      RuleStatus `json:"status"`
	Version     int        `json:"version"`
	Author      string     `json:"author"`
	Severity    string     `json:"severity"`
	Tags        []string   `json:"tags"`
	MITREIDs    []string   `json:"mitre_ids"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// RuleTestRequest defines parameters for testing detection rules against sample data.
type RuleTestRequest struct {
	Type          RuleType `json:"type" binding:"required"`
	Content       string   `json:"content" binding:"required"`
	SamplePayload string   `json:"sample_payload" binding:"required"`
}

// RuleTestResult details execution results of a rule test.
type RuleTestResult struct {
	Valid         bool     `json:"valid"`
	MatchesFound  int      `json:"matches_found"`
	MatchDetails  []string `json:"match_details"`
	ExecutionTime string   `json:"execution_time"`
	SyntaxErrors  []string `json:"syntax_errors"`
	Warnings      []string `json:"warnings"`
}

// RuleSimulationRequest defines parameters for backtesting rules against historical logs.
type RuleSimulationRequest struct {
	RuleID    string `json:"rule_id" binding:"required"`
	TimeRange string `json:"time_range"` // e.g. "24h", "7d"
}

// RuleSimulationResult details backtesting simulation metrics.
type RuleSimulationResult struct {
	RuleID            string    `json:"rule_id"`
	EventsSimulated   int       `json:"events_simulated"`
	MatchesCount      int       `json:"matches_count"`
	EstimatedFalsePos float64   `json:"estimated_false_positives"` // percentage
	SimulatedCoverage float64   `json:"simulated_coverage"`        // percentage
	ExecutedAt        time.Time `json:"executed_at"`
}

// DetectionMetrics provides analytical metrics on detection engineering posture.
type DetectionMetrics struct {
	TotalRules           int            `json:"total_rules"`
	ActiveSigmaRules     int            `json:"active_sigma_rules"`
	ActiveYaraRules      int            `json:"active_yara_rules"`
	ActiveCustomRules    int            `json:"active_custom_rules"`
	TotalDetections24h   int            `json:"total_detections_24h"`
	MITRECoveragePercent float64        `json:"mitre_coverage_percent"`
	SeverityBreakdown    map[string]int `json:"severity_breakdown"`
	LastScanTime         time.Time      `json:"last_scan_time"`
}
