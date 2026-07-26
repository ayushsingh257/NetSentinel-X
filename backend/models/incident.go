package models

import "time"

type Incident struct {
	ID                    string                  `json:"id"`
	Title                 string                  `json:"title"`
	Summary               string                  `json:"summary"`
	Severity              string                  `json:"severity"` // "CRITICAL", "HIGH", "MEDIUM", "LOW"
	Priority              string                  `json:"priority"` // "P1", "P2", "P3", "P4"
	Status                string                  `json:"status"`   // "NEW", "TRIAGED", "INVESTIGATING", "CONTAINMENT", "ERADICATION", "RECOVERY", "CLOSED"
	AssignedAnalyst       string                  `json:"assigned_analyst"`
	AssignedRole          string                  `json:"assigned_role"`
	CreatedAt             time.Time               `json:"created_at"`
	UpdatedAt             time.Time               `json:"updated_at"`
	DueDate               time.Time               `json:"due_date"`
	AffectedAssets        []string                `json:"affected_assets"`
	RelatedAlerts         []string                `json:"related_alerts"`
	RelatedInvestigations []string                `json:"related_investigations"`
	RelatedIOCs           []string                `json:"related_iocs"`
	MITRETechniques       []string                `json:"mitre_techniques"`
	Timeline              []IncidentTimelineEntry `json:"timeline"`
	Evidence              []IncidentEvidence      `json:"evidence"`
	ResolutionNotes       string                  `json:"resolution_notes"`
	SLA                   SLARecord               `json:"sla"`
}

type IncidentTimelineEntry struct {
	ID         string    `json:"id"`
	IncidentID string    `json:"incident_id"`
	Timestamp  time.Time `json:"timestamp"`
	Activity   string    `json:"activity"`
	Category   string    `json:"category"`
	Actor      string    `json:"actor"`
	Details    string    `json:"details"`
}

type IncidentEvidence struct {
	ID            string    `json:"id"`
	IncidentID    string    `json:"incident_id"`
	Timestamp     time.Time `json:"timestamp"`
	Source        string    `json:"source"`
	Type          string    `json:"type"` // "PACKET", "LOG", "ALERT", "IOC_RESULT", "REPORT", "ANALYST_NOTE"
	Title         string    `json:"title"`
	Content       string    `json:"content"`
	RelatedEntity string    `json:"related_entity"`
	Confidence    float64   `json:"confidence"`
}

type SLARecord struct {
	IncidentID              string `json:"incident_id"`
	TargetResponseTimeMin   int    `json:"target_response_time_min"`
	TargetResolutionTimeMin int    `json:"target_resolution_time_min"`
	ActualResponseTimeMin   int    `json:"actual_response_time_min"`
	ActualResolutionTimeMin int    `json:"actual_resolution_time_min"`
	SLAStatus               string `json:"sla_status"` // "ON_TRACK", "WARNING", "BREACHED"
	RemainingMinutes        int    `json:"remaining_minutes"`
}

type IncidentOverview struct {
	TotalIncidents    int            `json:"total_incidents"`
	OpenIncidents     int            `json:"open_incidents"`
	CriticalIncidents int            `json:"critical_incidents"`
	SLABreachCount    int            `json:"sla_breach_count"`
	AvgMTTRMinutes    int            `json:"avg_mttr_minutes"`
	IncidentsByStatus map[string]int `json:"incidents_by_status"`
	RecentIncidents   []Incident     `json:"recent_incidents"`
}
