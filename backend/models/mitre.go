package models

type MITRETechnique struct {
	ID                    string   `json:"id"`
	Name                  string   `json:"name"`
	Tactic                string   `json:"tactic"`
	Description           string   `json:"description"`
	DetectionCount        int      `json:"detection_count"`
	RiskLevel             string   `json:"risk_level"`
	ConfidenceScore       float64  `json:"confidence_score"`
	AffectedHosts         []string `json:"affected_hosts"`
	CurrentAlerts         []string `json:"current_alerts"`
	RelatedInvestigations []string `json:"related_investigations"`
	AIExplanation         string   `json:"ai_explanation"`
	MitigationGuidance    string   `json:"mitigation_guidance"`
	ReferenceLinks        []string `json:"reference_links"`
}

type MITRETacticGroup struct {
	TacticName string           `json:"tactic_name"`
	Techniques []MITRETechnique `json:"techniques"`
}

type MITREHeatMap struct {
	MostTriggeredTechniques []string       `json:"most_triggered_techniques"`
	MostActiveTactics       []string       `json:"most_active_tactics"`
	MostAttackedHosts       []string       `json:"most_attacked_hosts"`
	TechniqueFrequency      map[string]int `json:"technique_frequency"`
	SeverityDistribution    map[string]int `json:"severity_distribution"`
	TacticsCoverage         []string       `json:"tactics_coverage"`
}

type MITREStatistics struct {
	TotalTechniquesMapped int      `json:"total_techniques_mapped"`
	ActiveTacticsCount    int      `json:"active_tactics_count"`
	HighRiskTechniques    int      `json:"high_risk_techniques"`
	TopAttackedHost       string   `json:"top_attacked_host"`
	OverallPostureScore   float64  `json:"overall_posture_score"`
	Tactics               []string `json:"tactics"`
}
