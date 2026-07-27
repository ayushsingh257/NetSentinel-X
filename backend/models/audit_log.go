package models

import "time"

type AuditLog struct {
	ID         string                 `json:"id"`
	Timestamp  time.Time              `json:"timestamp"`
	UserID     string                 `json:"user_id"`
	Username   string                 `json:"username"`
	Role       string                 `json:"role"`
	Action     string                 `json:"action"`   // "USER_LOGIN", "INCIDENT_CREATED", "THREAT_HUNT_EXECUTED", "WORKFLOW_APPROVED", "REPORT_GENERATED", "RULE_UPDATED", "IOC_LOOKUP_EXECUTED"
	Category   string                 `json:"category"` // "AUTHENTICATION", "INCIDENT", "THREAT_HUNT", "DETECTION", "WORKFLOW", "REPORT", "ADMINISTRATION", "SYSTEM"
	Resource   string                 `json:"resource"`
	ResourceID string                 `json:"resource_id"`
	IPAddress  string                 `json:"ip_address"`
	UserAgent  string                 `json:"user_agent"`
	Severity   string                 `json:"severity"` // "LOW", "MEDIUM", "HIGH", "CRITICAL"
	Status     string                 `json:"status"`   // "SUCCESS", "FAILURE", "DENIED"
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
}
