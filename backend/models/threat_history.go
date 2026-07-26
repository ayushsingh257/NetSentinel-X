package models

import "time"

type HistoricalEvent struct {
	ID              string    `json:"id"`
	EventType       string    `json:"event_type"` // "TRAFFIC", "ALERT", "IOC_MATCH", "UEBA_ANOMALY", "DETECTION", "INCIDENT"
	Source          string    `json:"source"`
	Destination     string    `json:"destination"`
	Protocol        string    `json:"protocol"`
	RiskScore       int       `json:"risk_score"`
	MITRETechnique  string    `json:"mitre_technique"`
	Description     string    `json:"description"`
	Timestamp       time.Time `json:"timestamp"`
	RelatedIOC      string    `json:"related_ioc"`
	RelatedIncident string    `json:"related_incident"`
}

type IOCHistory struct {
	IOC               string    `json:"ioc"`
	IOCType           string    `json:"ioc_type"` // "IP", "DOMAIN", "HASH", "URL"
	FirstSeen         time.Time `json:"first_seen"`
	LastSeen          time.Time `json:"last_seen"`
	TotalOccurrences  int       `json:"total_occurrences"`
	RiskTrend         string    `json:"risk_trend"` // "INCREASING", "STABLE", "DECREASING"
	PreviousIncidents []string  `json:"previous_incidents"`
	RelatedCampaigns  []string  `json:"related_campaigns"`
	SeverityHistory   []int     `json:"severity_history"`
}

type AttackReplayEvent struct {
	StepIndex   int       `json:"step_index"`
	NodeType    string    `json:"node_type"`
	Label       string    `json:"label"`
	Description string    `json:"description"`
	Timestamp   time.Time `json:"timestamp"`
	RiskScore   int       `json:"risk_score"`
}

type ThreatHuntResult struct {
	QueryText          string              `json:"query_text"`
	Hypothesis         string              `json:"hypothesis"`
	MatchedEvents      []HistoricalEvent   `json:"matched_events"`
	IOCMatches         []IOCHistory        `json:"ioc_matches"`
	ReplaySequence     []AttackReplayEvent `json:"replay_sequence"`
	RiskExplanation    string              `json:"risk_explanation"`
	InvestigationSteps []string            `json:"investigation_steps"`
	ConfidenceScore    int                 `json:"confidence_score"`
}
