package models

import "time"

type AttackNode struct {
	ID               string   `json:"id"`
	Type             string   `json:"type"` // "EXTERNAL_IP", "INTERNAL_HOST", "USER", "DOMAIN", "IOC", "DETECTION_RULE", "INCIDENT", "MITRE_TECHNIQUE"
	Label            string   `json:"label"`
	IP               string   `json:"ip"`
	Hostname         string   `json:"hostname"`
	Domain           string   `json:"domain"`
	Asset            string   `json:"asset"`
	ThreatScore      int      `json:"threat_score"` // 0-100
	RiskLevel        string   `json:"risk_level"`   // "CRITICAL", "HIGH", "MEDIUM", "LOW"
	MITRETechniques  []string `json:"mitre_techniques"`
	RelatedIncidents []string `json:"related_incidents"`
}

type AttackEdge struct {
	ID           string    `json:"id"`
	Source       string    `json:"source"`
	Target       string    `json:"target"`
	Relationship string    `json:"relationship"` // "Connected To", "Communicated With", "Triggered", "Detected By", "Mapped To", "Caused"
	Confidence   float64   `json:"confidence"`
	Timestamp    time.Time `json:"timestamp"`
}

type AttackPath struct {
	ID                     string   `json:"id"`
	PathName               string   `json:"path_name"`
	NodeIDs                []string `json:"node_ids"`
	EdgeIDs                []string `json:"edge_ids"`
	Severity               string   `json:"severity"`
	PathRiskScore          int      `json:"path_risk_score"`
	AIExplanation          string   `json:"ai_explanation"`
	RootCause              string   `json:"root_cause"`
	AttackerObjective      string   `json:"attacker_objective"`
	AffectedAssets         []string `json:"affected_assets"`
	RecommendedContainment string   `json:"recommended_containment"`
}

type AttackGraphPayload struct {
	Nodes              []AttackNode `json:"nodes"`
	Edges              []AttackEdge `json:"edges"`
	CriticalPaths      []AttackPath `json:"critical_paths"`
	TotalNodes         int          `json:"total_nodes"`
	TotalEdges         int          `json:"total_edges"`
	GlobalMaxRiskScore int          `json:"global_max_risk_score"`
}
