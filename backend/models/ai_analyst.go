package models

import "time"

// LLMProviderType represents the supported LLM backend provider type.
type LLMProviderType string

const (
	ProviderGemini    LLMProviderType = "GEMINI"
	ProviderOpenAI    LLMProviderType = "OPENAI"
	ProviderAnthropic LLMProviderType = "ANTHROPIC"
	ProviderOllama    LLMProviderType = "OLLAMA"
	ProviderMock      LLMProviderType = "MOCK"
)

// AIAnalysisContext holds analytical context metadata.
type AIAnalysisContext struct {
	AnalystID   string    `json:"analyst_id"`
	Provider    string    `json:"provider"`
	Confidence  float64   `json:"confidence"` // 0.0 to 1.0
	ModelName   string    `json:"model_name"`
	TokensUsed  int       `json:"tokens_used"`
	GeneratedAt time.Time `json:"generated_at"`
}

// 1. Alert Explanation
type ExplainAlertRequest struct {
	AlertID    string `json:"alert_id" binding:"required"`
	Title      string `json:"title"`
	Severity   string `json:"severity"`
	Source     string `json:"source"`
	RawPayload string `json:"raw_payload"`
}

type ExplainAlertResponse struct {
	AlertID           string            `json:"alert_id"`
	Summary           string            `json:"summary"`
	RootCause         string            `json:"root_cause"`
	RecommendedAction string            `json:"recommended_action"`
	SeverityAnalysis  string            `json:"severity_analysis"`
	Context           AIAnalysisContext `json:"context"`
}

// 2. Threat Summarization
type SummarizeThreatRequest struct {
	ThreatID      string   `json:"threat_id" binding:"required"`
	ThreatType    string   `json:"threat_type"`
	Indicators    []string `json:"indicators"`
	AffectedHosts []string `json:"affected_hosts"`
}

type SummarizeThreatResponse struct {
	ThreatID         string            `json:"threat_id"`
	ExecutiveSummary string            `json:"executive_summary"`
	TechnicalDetails string            `json:"technical_details"`
	PotentialImpact  string            `json:"potential_impact"`
	MitigationSteps  []string          `json:"mitigation_steps"`
	Context          AIAnalysisContext `json:"context"`
}

// 3. Incident Summarization
type SummarizeIncidentRequest struct {
	IncidentID    string   `json:"incident_id" binding:"required"`
	Title         string   `json:"title"`
	RelatedAlerts []string `json:"related_alerts"`
	Scope         string   `json:"scope"`
}

type SummarizeIncidentResponse struct {
	IncidentID       string            `json:"incident_id"`
	ExecutiveSummary string            `json:"executive_summary"`
	TimelineOverview string            `json:"timeline_overview"`
	BlastRadius      string            `json:"blast_radius"`
	ContainmentPlan  []string          `json:"containment_plan"`
	Context          AIAnalysisContext `json:"context"`
}

// 4. Attack Timeline Explanation
type ExplainTimelineRequest struct {
	TimelineID string   `json:"timeline_id" binding:"required"`
	EventChain []string `json:"event_chain"`
	TimeRange  string   `json:"time_range"`
}

type ExplainTimelineResponse struct {
	TimelineID       string            `json:"timeline_id"`
	Narrative        string            `json:"narrative"`
	InitialAccess    string            `json:"initial_access"`
	LateralMovement  string            `json:"lateral_movement"`
	ExfiltrationRisk string            `json:"exfiltration_risk"`
	Context          AIAnalysisContext `json:"context"`
}

// 5. IOC Explanation
type ExplainIOCRequest struct {
	IOCValue string `json:"ioc_value" binding:"required"`
	IOCType  string `json:"ioc_type" binding:"required"` // IP, DOMAIN, HASH, URL
}

type ExplainIOCResponse struct {
	IOCValue         string            `json:"ioc_value"`
	IOCType          string            `json:"ioc_type"`
	ThreatActor      string            `json:"threat_actor"`
	MalwareFamily    string            `json:"malware_family"`
	ReputationScore  int               `json:"reputation_score"` // 0-100
	RecommendedBlock bool              `json:"recommended_block"`
	Context          AIAnalysisContext `json:"context"`
}

// 6. MITRE ATT&CK Explanation
type ExplainMITRERequest struct {
	TechniqueID   string `json:"technique_id" binding:"required"` // e.g. T1059
	TechniqueName string `json:"technique_name"`
}

type ExplainMITREResponse struct {
	TechniqueID       string            `json:"technique_id"`
	TechniqueName     string            `json:"technique_name"`
	Tactic            string            `json:"tactic"`
	Explanation       string            `json:"explanation"`
	DetectionMethods  []string          `json:"detection_methods"`
	DefensiveControls []string          `json:"defensive_controls"`
	Context           AIAnalysisContext `json:"context"`
}

// 7. Threat Hunting Assistant
type ThreatHuntingQueryRequest struct {
	QueryPrompt string `json:"query_prompt" binding:"required"`
	TargetScope string `json:"target_scope"`
}

type ThreatHuntingQueryResponse struct {
	QueryPrompt      string            `json:"query_prompt"`
	GeneratedQuery   string            `json:"generated_query"`
	QueryType        string            `json:"query_type"` // SIGMA, YARA, SQL, KQL
	HuntingStrategy  string            `json:"hunting_strategy"`
	ExpectedFindings string            `json:"expected_findings"`
	Context          AIAnalysisContext `json:"context"`
}

// 8. Investigation Assistant
type InvestigationAssistanceRequest struct {
	IncidentID    string   `json:"incident_id" binding:"required"`
	CurrentState  string   `json:"current_state"`
	EvidenceLinks []string `json:"evidence_links"`
}

type InvestigationAssistanceResponse struct {
	IncidentID           string            `json:"incident_id"`
	SuggestedNextSteps   []string          `json:"suggested_next_steps"`
	ArtifactsToCollect   []string          `json:"artifacts_to_collect"`
	Hypothesis           string            `json:"hypothesis"`
	RecommendedForensics string            `json:"recommended_forensics"`
	Context              AIAnalysisContext `json:"context"`
}
