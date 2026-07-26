package models

import "time"

type TimelineEvent struct {
	Step        int       `json:"step"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Protocol    string    `json:"protocol"`
	SourceIP    string    `json:"source_ip"`
	DestIP      string    `json:"dest_ip"`
	Timestamp   time.Time `json:"timestamp"`
	Severity    string    `json:"severity"`
}

type EvidenceRecord struct {
	ID          string `json:"id"`
	Source      string `json:"source"`
	Type        string `json:"type"`
	Description string `json:"description"`
	Value       string `json:"value"`
	Timestamp   string `json:"timestamp"`
}

type Investigation struct {
	ID                 string           `json:"id"`
	Title              string           `json:"title"`
	Severity           string           `json:"severity"`
	ThreatStory        string           `json:"threat_story"`
	RootCause          string           `json:"root_cause"`
	ConfidenceScore    float64          `json:"confidence_score"`
	ConfidenceLevel    string           `json:"confidence_level"`
	MITRETechnique     string           `json:"mitre_technique"`
	MITRETactic        string           `json:"mitre_tactic"`
	AffectedAssets     []string         `json:"affected_assets"`
	Timeline           []TimelineEvent  `json:"timeline"`
	Evidence           []EvidenceRecord `json:"evidence"`
	RecommendedActions []string         `json:"recommended_actions"`
	Status             string           `json:"status"`
	CreatedAt          time.Time        `json:"created_at"`
}
