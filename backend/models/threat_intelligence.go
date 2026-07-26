package models

import "time"

type ProviderResult struct {
	ProviderName string    `json:"provider_name"`
	Status       string    `json:"status"` // "MALICIOUS", "SUSPICIOUS", "CLEAN", "UNKNOWN"
	Score        float64   `json:"score"`  // Provider raw score / ratio
	Category     string    `json:"category"`
	Details      string    `json:"details"`
	LastQueried  time.Time `json:"last_queried"`
}

type IOCRecord struct {
	ID                    string                    `json:"id"`
	Type                  string                    `json:"type"` // "IP", "DOMAIN", "URL", "HASH", "CERT"
	Value                 string                    `json:"value"`
	ThreatScore           int                       `json:"threat_score"` // 0-100
	RiskLevel             string                    `json:"risk_level"`   // "CRITICAL", "HIGH", "MEDIUM", "LOW"
	Confidence            float64                   `json:"confidence"`   // 0.0 - 1.0
	FirstSeen             time.Time                 `json:"first_seen"`
	LastSeen              time.Time                 `json:"last_seen"`
	Country               string                    `json:"country"`
	ASN                   string                    `json:"asn"`
	Organization          string                    `json:"organization"`
	Reputation            string                    `json:"reputation"`
	Categories            []string                  `json:"categories"`
	RelatedThreats        []string                  `json:"related_threats"`
	MITRETechniques       []string                  `json:"mitre_techniques"`
	RelatedAlerts         []string                  `json:"related_alerts"`
	RelatedInvestigations []string                  `json:"related_investigations"`
	ProviderResults       map[string]ProviderResult `json:"provider_results"`
	AIExplanation         string                    `json:"ai_explanation"`
	RecommendedActions    []string                  `json:"recommended_actions"`
	UpdatedAt             time.Time                 `json:"updated_at"`
}

type EnrichmentRequest struct {
	IOCType  string `json:"ioc_type"`
	IOCValue string `json:"ioc_value"`
}

type IntelligenceOverview struct {
	TotalIOCsEnriched    int             `json:"total_iocs_enriched"`
	HighRiskIOCs         int             `json:"high_risk_iocs"`
	ActiveProvidersCount int             `json:"active_providers_count"`
	TopAttackedDomains   []string        `json:"top_attacked_domains"`
	TopAttackedIPs       []string        `json:"top_attacked_ips"`
	ProviderHealth       map[string]bool `json:"provider_health"`
}
