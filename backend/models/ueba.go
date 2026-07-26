package models

import "time"

type EntityProfile struct {
	ID                   string         `json:"id"`
	EntityType           string         `json:"entity_type"` // "HOST", "USER", "IP", "DOMAIN"
	EntityName           string         `json:"entity_name"`
	RiskScore            int            `json:"risk_score"` // 0-100
	RiskLevel            string         `json:"risk_level"` // "CRITICAL", "HIGH", "MEDIUM", "LOW"
	BaselineConnRate     float64        `json:"baseline_conn_rate"`
	BaselinePacketVolume int64          `json:"baseline_packet_volume"`
	BaselineProtocolMap  map[string]int `json:"baseline_protocol_map"`
	AnomaliesCount       int            `json:"anomalies_count"`
	LastActive           time.Time      `json:"last_active"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
}

type AnomalyRecord struct {
	ID                  string    `json:"id"`
	EntityID            string    `json:"entity_id"`
	EntityName          string    `json:"entity_name"`
	AnomalyScore        int       `json:"anomaly_score"` // 0-100
	Category            string    `json:"category"`      // "Beaconing", "Port Scan", "Brute Force", "Lateral Movement", "Data Exfiltration", "DNS Tunneling"
	Reason              string    `json:"reason"`
	ObservedBehaviour   string    `json:"observed_behaviour"`
	ExpectedBehaviour   string    `json:"expected_behaviour"`
	DeviationPercentage float64   `json:"deviation_percentage"`
	RelatedAlerts       []string  `json:"related_alerts"`
	RelatedIOCs         []string  `json:"related_iocs"`
	MITRETechniques     []string  `json:"mitre_techniques"`
	Timestamp           time.Time `json:"timestamp"`
	AIExplanation       string    `json:"ai_explanation"`
	RecommendedAction   string    `json:"recommended_action"`
}

type UEBAOverview struct {
	TotalEntitiesMonitored int             `json:"total_entities_monitored"`
	HighRiskEntitiesCount  int             `json:"high_risk_entities_count"`
	ActiveAnomaliesCount   int             `json:"active_anomalies_count"`
	RiskDistribution       map[string]int  `json:"risk_distribution"`
	Leaderboard            []EntityProfile `json:"leaderboard"`
}
