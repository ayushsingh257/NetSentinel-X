package models

import "time"

type DetectionRule struct {
	ID                string    `json:"id"`
	Name              string    `json:"name"`
	Description       string    `json:"description"`
	Author            string    `json:"author"`
	Severity          string    `json:"severity"`
	Type              string    `json:"type"` // "SIGMA" or "YARA"
	MITRETechnique    string    `json:"mitre_technique"`
	MITRETactic       string    `json:"mitre_tactic"`
	Logic             string    `json:"logic"`
	Status            string    `json:"status"` // "ENABLED" or "DISABLED"
	Version           string    `json:"version"`
	DetectionCount    int       `json:"detection_count"`
	FalsePositiveRate float64   `json:"false_positive_rate"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type SimulationRequest struct {
	RuleID        string `json:"rule_id,omitempty"`
	RuleType      string `json:"rule_type"`
	RuleLogic     string `json:"rule_logic"`
	SamplePayload string `json:"sample_payload"`
}

type SimulationResponse struct {
	Matched         bool      `json:"matched"`
	RuleName        string    `json:"rule_name"`
	Severity        string    `json:"severity"`
	MITRETechnique  string    `json:"mitre_technique"`
	AffectedAsset   string    `json:"affected_asset"`
	Evidence        string    `json:"evidence"`
	ConfidenceScore float64   `json:"confidence_score"`
	ExecutionTimeMs float64   `json:"execution_time_ms"`
	Timestamp       time.Time `json:"timestamp"`
}

type DetectionAnalytics struct {
	TotalRules         int      `json:"total_rules"`
	ActiveRules        int      `json:"active_rules"`
	TotalDetections    int      `json:"total_detections"`
	AvgFalsePositive   float64  `json:"avg_false_positive"`
	MITRECoverage      float64  `json:"mitre_coverage"`
	MostTriggeredRules []string `json:"most_triggered_rules"`
	DetectionGaps      []string `json:"detection_gaps"`
}
