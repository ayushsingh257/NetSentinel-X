package models

import "time"

// BackupRecord represents an encrypted, hashed database backup artifact.
type BackupRecord struct {
	ID                   string    `json:"id"`
	BackupType           string    `json:"backup_type"` // "FULL", "INCREMENTAL", "SNAPSHOT"
	CreatedAt            time.Time `json:"created_at"`
	StorageLocation      string    `json:"storage_location"`
	EncryptionStatus     string    `json:"encryption_status"` // "ENCRYPTED_AES256", "UNENCRYPTED"
	IntegrityHash        string    `json:"integrity_hash"`    // SHA-256 Hash
	BackupSize           int64     `json:"backup_size"`       // Size in bytes
	RestoreStatus        string    `json:"restore_status"`    // "RESTORE_READY", "RESTORE_FAILED", "BACKUP_CORRUPTED"
	EncryptionKeyRef     string    `json:"encryption_key_ref"`
	KeyRotationTimestamp time.Time `json:"key_rotation_timestamp"`
}

// BackupStatusResponse represents the current status of the backup system.
type BackupStatusResponse struct {
	HealthScore        int           `json:"health_score"` // 0 - 100
	Status             string        `json:"status"`       // "HEALTHY", "WARNING", "CRITICAL"
	LatestBackup       *BackupRecord `json:"latest_backup"`
	RPOCompliance      string        `json:"rpo_compliance"` // "5 Minutes Target Met (Active: 2m)"
	RTOCompliance      string        `json:"rto_compliance"` // "30 Minutes Target Met (Est: 12m)"
	TotalBackupsCount  int           `json:"total_backups_count"`
	EncryptionEnforced bool          `json:"encryption_enforced"`
}

// BackupIntegrityResponse details cryptographic integrity verification across backups.
type BackupIntegrityResponse struct {
	TotalChecked   int      `json:"total_checked"`
	ValidCount     int      `json:"valid_count"`
	CorruptedCount int      `json:"corrupted_count"`
	Algorithm      string   `json:"algorithm"` // "SHA-256"
	Status         string   `json:"status"`    // "VERIFIED", "CORRUPTED_DETECTED"
	Details        []string `json:"details"`
}

// RecoveryReadinessResponse details RPO/RTO metrics and recovery readiness.
type RecoveryReadinessResponse struct {
	RPOMinutesTarget  int    `json:"rpo_minutes_target"`  // 5
	RPOMinutesCurrent int    `json:"rpo_minutes_current"` // 2
	RTOMinutesTarget  int    `json:"rto_minutes_target"`  // 30
	RTOMinutesEst     int    `json:"rto_minutes_est"`     // 12
	ReadinessScore    int    `json:"readiness_score"`     // 100
	ReadinessStatus   string `json:"readiness_status"`    // "RESTORE_READY"
	FailoverReady     bool   `json:"failover_ready"`
}

// RestoreTestResponse details outcome of a restore simulation test.
type RestoreTestResponse struct {
	TestID         string    `json:"test_id"`
	ExecutedAt     time.Time `json:"executed_at"`
	BackupIDTarget string    `json:"backup_id_target"`
	Outcome        string    `json:"outcome"` // "RESTORE_READY", "RESTORE_FAILED", "BACKUP_CORRUPTED"
	DurationMs     int64     `json:"duration_ms"`
	Logs           []string  `json:"logs"`
}
