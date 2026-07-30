package models

import "time"

// SecurityAuditResult represents the output of an automated security audit check.
type SecurityAuditResult struct {
	AuditID        string    `json:"audit_id"`
	Category       string    `json:"category"`
	CheckName      string    `json:"check_name"`
	Status         string    `json:"status"` // PASS, WARNING, FAIL
	Severity       string    `json:"severity"`
	Recommendation string    `json:"recommendation"`
	Timestamp      time.Time `json:"timestamp"`
}

// VulnerabilityFinding represents a vulnerability discovered during security scanning.
type VulnerabilityFinding struct {
	CVEID       string `json:"cve_id"`
	Component   string `json:"component"`
	Severity    string `json:"severity"` // CRITICAL, HIGH, MEDIUM, LOW
	Status      string `json:"status"`
	Remediation string `json:"remediation"`
}

// VulnerabilityReport represents the summary report of automated vulnerability assessments.
type VulnerabilityReport struct {
	TotalVulnerabilities int                    `json:"total_vulnerabilities"`
	CriticalCount        int                    `json:"critical_count"`
	HighCount            int                    `json:"high_count"`
	MediumCount          int                    `json:"medium_count"`
	LowCount             int                    `json:"low_count"`
	Findings             []VulnerabilityFinding `json:"findings"`
	ScannedAt            time.Time              `json:"scanned_at"`
}

// OWASPCheckResult represents an individual OWASP Top 10 evaluation item.
type OWASPCheckResult struct {
	Category    string `json:"category"`
	Name        string `json:"name"`
	Status      string `json:"status"` // PASS, FAIL
	Score       int    `json:"score"`
	Description string `json:"description"`
}

// OWASPComplianceScore represents the complete OWASP Top 10 compliance evaluation.
type OWASPComplianceScore struct {
	OverallScore     int                `json:"overall_score"`
	PassedCategories int                `json:"passed_categories"`
	TotalCategories  int                `json:"total_categories"`
	CategoryResults  []OWASPCheckResult `json:"category_results"`
	EvaluatedAt      time.Time          `json:"evaluated_at"`
}

// AttackSimulationResult represents the outcome of an attack vector simulation.
type AttackSimulationResult struct {
	SimulationID     string    `json:"simulation_id"`
	AttackType       string    `json:"attack_type"`
	Target           string    `json:"target"`
	DetectionStatus  string    `json:"detection_status"` // ATTACK_DETECTED, ATTACK_MISSED
	ResponseTimeMS   int64     `json:"response_time_ms"`
	MitigationStatus string    `json:"mitigation_status"`
	ExecutedAt       time.Time `json:"executed_at"`
}

// EnterpriseSecurityScore represents the unified security score of NetSentinel-X V2.
type EnterpriseSecurityScore struct {
	OverallScore        int       `json:"overall_score"`
	Rating              string    `json:"rating"` // ENTERPRISE READY
	IdentityScore       float64   `json:"identity_score"`
	AppSecScore         float64   `json:"app_sec_score"`
	InfraScore          float64   `json:"infra_score"`
	DataProtectionScore float64   `json:"data_protection_score"`
	MonitoringScore     float64   `json:"monitoring_score"`
	ComplianceScore     float64   `json:"compliance_score"`
	LastAuditDate       time.Time `json:"last_audit_date"`
}
