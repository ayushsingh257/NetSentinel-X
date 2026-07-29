package models

import "time"

// DataClassificationLevel represents the sensitivity of database fields.
type DataClassificationLevel string

const (
	ClassificationPublic       DataClassificationLevel = "PUBLIC"
	ClassificationInternal     DataClassificationLevel = "INTERNAL"
	ClassificationConfidential DataClassificationLevel = "CONFIDENTIAL"
	ClassificationRestricted   DataClassificationLevel = "RESTRICTED"
)

// DatabaseRole represents a defined database user role.
type DatabaseRole struct {
	RoleName    string   `json:"role_name"`
	Permissions []string `json:"permissions"` // SELECT, INSERT, UPDATE, DELETE, etc.
	Superuser   bool     `json:"superuser"`
	Description string   `json:"description"`
}

// DatabaseQueryAuditLog represents an audited SQL execution event.
type DatabaseQueryAuditLog struct {
	ID        string    `json:"id"`
	User      string    `json:"user"`
	Action    string    `json:"action"` // SELECT, INSERT, UPDATE, DELETE, ALTER, DROP
	Table     string    `json:"table"`
	Timestamp time.Time `json:"timestamp"`
	IP        string    `json:"ip"`
	Result    string    `json:"result"` // SUCCESS, BLOCKED, DENIED
	Query     string    `json:"query"`  // Sanitized query snippet
}

// BackupSecurityPosture represents the health and security of database backups.
type BackupSecurityPosture struct {
	Score            int       `json:"score"`
	BackupEnabled    bool      `json:"backup_enabled"`
	EncryptionActive bool      `json:"encryption_active"`
	Frequency        string    `json:"frequency"` // "Daily (24h)"
	RestoreTested    bool      `json:"restore_tested"`
	LastBackupTime   time.Time `json:"last_backup_time"`
	LastRestoreTest  time.Time `json:"last_restore_test"`
	Status           string    `json:"status"` // "SECURE", "WARNING", "CRITICAL"
}
