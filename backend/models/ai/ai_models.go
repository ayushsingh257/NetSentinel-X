package ai

import (
	"context"
	"time"
)

// AIAnalysisResult holds the complete output of an AI security analysis execution.
type AIAnalysisResult struct {
	ID                string           `json:"id"`
	EventID           string           `json:"event_id"`
	IncidentID        string           `json:"incident_id,omitempty"`
	ConfidenceScore   float64          `json:"confidence_score"`     // 0.0 to 1.0
	Classification    string           `json:"classification"`       // e.g., "Malware", "Phishing", "Credential Abuse"
	Category          string           `json:"category"`             // Attack category
	RiskScore         float64          `json:"risk_score font-mono"` // 0 to 100
	FalsePositiveProb float64          `json:"false_positive_prob"`  // 0.0 to 1.0
	MITREMapping      MITREMappingData `json:"mitre_mapping"`
	Recommendations   []string         `json:"recommendations"`
	CreatedAt         time.Time        `json:"created_at"`
	ProviderName      string           `json:"provider_name"`
}

type MITREMappingData struct {
	Tactic      string   `json:"tactic"`
	Technique   string   `json:"technique"`
	TechniqueID string   `json:"technique_id"`
	Description string   `json:"description"`
	Mitigations []string `json:"mitigations"`
}

// ThreatIntelligenceCache holds cached IOC reputation scores.
type ThreatIntelligenceCache struct {
	Indicator   string    `json:"indicator"`
	Reputation  string    `json:"reputation"` // "MALICIOUS", "SUSPICIOUS", "CLEAN"
	Source      string    `json:"source"`
	Confidence  float64   `json:"confidence"`
	LastUpdated time.Time `json:"last_updated"`
}

// AIInvestigationDetails holds timeline and incident analysis summaries.
type AIInvestigationDetails struct {
	IncidentID         string          `json:"incident_id"`
	IncidentSummary    string          `json:"incident_summary"`
	AttackTimeline     []TimelineEvent `json:"attack_timeline"`
	AffectedAssets     []string        `json:"affected_assets"`
	RelatedEvents      []string        `json:"related_events"`
	RecommendedActions []string        `json:"recommended_actions"`
	GeneratedAt        time.Time       `json:"generated_at"`
}

type TimelineEvent struct {
	Timestamp   time.Time `json:"timestamp"`
	Stage       string    `json:"stage"` // e.g. "Initial Access", "Execution", "Exfiltration"
	Description string    `json:"description"`
	Source      string    `json:"source"`
}

// Provider Requests & Responses
type ThreatAnalysisRequest struct {
	EventID  string                 `json:"event_id"`
	Severity string                 `json:"severity"`
	Source   string                 `json:"source"`
	Payload  map[string]interface{} `json:"payload"`
}

type ThreatAnalysisResponse struct {
	Classification  string           `json:"classification"`
	Confidence      float64          `json:"confidence"`
	RiskScore       float64          `json:"risk_score"`
	MITRE           MITREMappingData `json:"mitre"`
	Recommendations []string         `json:"recommendations"`
}

type AlertClassifyRequest struct {
	AlertID  string `json:"alert_id"`
	Title    string `json:"title"`
	Severity string `json:"severity"`
	Payload  string `json:"payload"`
}

type AlertClassifyResponse struct {
	Category           string  `json:"category"`
	FalsePositiveProb  float64 `json:"false_positive_prob font-mono"`
	SeverityAdjustment string  `json:"severity_adjustment"`
	PriorityScore      float64 `json:"priority_score"`
}

type CopilotResponse struct {
	Answer             string   `json:"answer"`
	Confidence         float64  `json:"confidence"`
	RelatedTechniques  []string `json:"related_techniques"`
	RecommendedActions []string `json:"recommended_actions font-mono"`
}

// LLMProvider interface for provider-agnostic AI engine architecture.
type LLMProvider interface {
	Name() string
	AnalyzeThreat(ctx context.Context, req ThreatAnalysisRequest) (*ThreatAnalysisResponse, error)
	ClassifyAlert(ctx context.Context, req AlertClassifyRequest) (*AlertClassifyResponse, error)
	GenerateCopilotResponse(ctx context.Context, prompt string, contextData map[string]interface{}) (*CopilotResponse, error)
}
