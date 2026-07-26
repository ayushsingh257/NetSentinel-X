package models

import "time"

type Report struct {
	ID                     string            `json:"id"`
	Title                  string            `json:"title"`
	Type                   string            `json:"type"` // "EXECUTIVE", "SOC_DAILY", "INCIDENT", "THREAT_INTEL", "DETECTION_COVERAGE", "UEBA", "COMPLIANCE"
	AISummary              string            `json:"ai_summary"`
	BusinessImpact         string            `json:"business_impact"`
	SecurityScore          int               `json:"security_score"` // 0-100
	ThreatOverview         string            `json:"threat_overview"`
	ControlCoverageMap     map[string]int    `json:"control_coverage_map"`
	ComplianceStatusMap    map[string]string `json:"compliance_status_map"`
	GeneratedAt            time.Time         `json:"generated_at"`
	GeneratedBy            string            `json:"generated_by"`
	ExportFormatsAvailable []string          `json:"export_formats_available"`
	EvidenceItemsCount     int               `json:"evidence_items_count"`
}

type ComplianceFramework struct {
	Framework       string   `json:"framework"` // "SOC2", "ISO27001", "HIPAA"
	OverallStatus   string   `json:"overall_status"`
	PassedControls  int      `json:"passed_controls"`
	TotalControls   int      `json:"total_controls"`
	ComplianceScore int      `json:"compliance_score"` // 0-100
	ControlGaps     []string `json:"control_gaps"`
}

type ReportTemplate struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    string `json:"category"`
}

type ScheduledReport struct {
	ID         string    `json:"id"`
	Title      string    `json:"title"`
	Frequency  string    `json:"frequency"` // "DAILY", "WEEKLY", "MONTHLY"
	Recipients string    `json:"recipients"`
	NextRun    time.Time `json:"next_run"`
	Status     string    `json:"status"`
}
