package models

import "time"

// DataClassificationRecord represents data classification metadata.
type DataClassificationRecord struct {
	ID                   string    `json:"id"`
	ResourceID           string    `json:"resource_id"`
	ResourceType         string    `json:"resource_type"`        // "DATABASE_TABLE", "LOG_FILE", "API_ENDPOINT", "SECRET"
	ClassificationLevel  string    `json:"classification_level"` // "PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"
	ClassifiedBy         string    `json:"classified_by"`        // "AUTOMATIC_ENGINE", "SECURITY_ADMIN"
	ClassificationReason string    `json:"classification_reason"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

// PIIFinding details detected personally identifiable information.
type PIIFinding struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`     // "EMAIL", "PHONE", "IP", "ADDRESS", "NATIONAL_ID", "USERNAME", "TOKEN"
	Value       string    `json:"value"`    // Raw or masked
	Location    string    `json:"location"` // e.g. "audit_logs.payload"
	Severity    string    `json:"severity"` // "LOW", "MEDIUM", "HIGH", "CRITICAL"
	Status      string    `json:"status"`   // "PII_FOUND", "MASKED", "RESOLVED"
	DetectedAt  time.Time `json:"detected_at"`
	MaskedValue string    `json:"masked_value,omitempty"`
}

// RetentionPolicy defines data lifecycle and expiration rules.
type RetentionPolicy struct {
	ID                string    `json:"id"`
	DataType          string    `json:"data_type"`             // "SECURITY_LOGS", "AUDIT_LOGS", "TEMP_DATA"
	RetentionPeriod   int       `json:"retention_period_days"` // Days
	ActionAfterExpiry string    `json:"action_after_expiry"`   // "PURGE", "ARCHIVE", "ANONYMIZE"
	CreatedAt         time.Time `json:"created_at"`
}

// PrivacyAuditEvent records data access, masking, or modification events for compliance.
type PrivacyAuditEvent struct {
	ID        string    `json:"id"`
	EventType string    `json:"event_type"` // "PRIVACY_DATA_ACCESSED", "PII_DETECTED", "DATA_MASKED", "DATA_DELETED", "CLASSIFICATION_CHANGED"
	User      string    `json:"user"`
	Timestamp time.Time `json:"timestamp"`
	Resource  string    `json:"resource"`
	Action    string    `json:"action"`
	IPAddress string    `json:"ip_address"`
	Result    string    `json:"result"`
}

// ComplianceStatusResponse represents overall compliance readiness scores.
type ComplianceStatusResponse struct {
	OverallScore         int       `json:"overall_score"`  // 0 - 100
	SOC2Score            int       `json:"soc2_score"`     // 96
	ISO27001Score        int       `json:"iso27001_score"` // 98
	GDPRScore            int       `json:"gdpr_score"`     // 95
	Status               string    `json:"status"`         // "COMPLIANT", "NON_COMPLIANT"
	PIIFindingsCount     int       `json:"pii_findings_count"`
	ClassificationsCount int       `json:"classifications_count"`
	LastScanAt           time.Time `json:"last_scan_at"`
}

// ComplianceFrameworkMappingResponse returns control mapping for SOC2, ISO27001, GDPR.
type ComplianceFrameworkMappingResponse struct {
	SOC2Controls     []string `json:"soc2_controls"`
	ISO27001Controls []string `json:"iso27001_controls"`
	GDPRArticles     []string `json:"gdpr_articles"`
	ComplianceStatus string   `json:"compliance_status"`
}

// DataClassificationStatsResponse returns distribution counts per classification level.
type DataClassificationStatsResponse struct {
	PublicCount       int                        `json:"public_count"`
	InternalCount     int                        `json:"internal_count"`
	ConfidentialCount int                        `json:"confidential_count"`
	RestrictedCount   int                        `json:"restricted_count"`
	TotalResources    int                        `json:"total_resources"`
	Records           []DataClassificationRecord `json:"records"`
}
