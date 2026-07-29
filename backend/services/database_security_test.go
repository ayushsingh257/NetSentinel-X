package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDatabaseSecuritySuite(t *testing.T) {
	audit := NewAuditService()
	dbSecService := NewDatabaseSecurityService(audit)
	dataEncryptService := NewDataEncryptionService()
	dataClassService := NewDataClassificationService()
	dbAuditService := NewDatabaseAuditService()
	sqlSecService := NewSQLSecurityService()
	backupService := NewBackupSecurityService()

	// Test 1: Public database exposure detection -> CRITICAL
	t.Run("Test 1: Public database exposure detection", func(t *testing.T) {
		t.Setenv("DATABASE_PORT_EXPOSED", "true")
		posture := dbSecService.GetPosture()

		assert.True(t, posture.PublicAccess, "Public access must be flagged when port 5432 is exposed")
		critCheckFound := false
		for _, c := range posture.Checks {
			if c.Check == "Port 5432 Exposed Publicly" && c.Severity == "critical" && c.Status == "fail" {
				critCheckFound = true
			}
		}
		assert.True(t, critCheckFound, "Critical check failure must be logged for public DB exposure")
	})

	// Test 2: Weak database password -> BLOCKED
	t.Run("Test 2: Weak database password", func(t *testing.T) {
		t.Setenv("DATABASE_URL", "postgres://postgres:password123@localhost:5432/netsentinel")
		posture := dbSecService.GetPosture()

		weakPassFound := false
		for _, c := range posture.Checks {
			if c.Check == "Database Password Policy" && c.Status == "fail" {
				weakPassFound = true
			}
		}
		assert.True(t, weakPassFound, "Weak database password 'password123' must be blocked/failed")
	})

	// Test 3: Unsafe SQL query detection -> SQL_INJECTION_RISK
	t.Run("Test 3: Unsafe SQL query detection", func(t *testing.T) {
		unsafeQuery := "SELECT * FROM users WHERE name='" + "admin' OR '1'='1"
		result := sqlSecService.InspectQuery(unsafeQuery)

		assert.False(t, result.Safe, "Unsafe string concatenation query must be flagged as unsafe")
		assert.Equal(t, "SQL_INJECTION_RISK", result.Code)

		// Test safe parameterized query
		safeQuery := "SELECT id, username FROM users WHERE name = $1"
		safeResult := sqlSecService.InspectQuery(safeQuery)
		assert.True(t, safeResult.Safe)
		assert.Equal(t, "PARAMETRIZED_SAFE", safeResult.Code)
	})

	// Test 4: Encrypted database connection -> SECURE
	t.Run("Test 4: Encrypted database connection", func(t *testing.T) {
		t.Setenv("DATABASE_SSLMODE", "require")
		report := dataEncryptService.GetStatusReport()

		assert.True(t, report.DataInTransitActive)
		assert.Equal(t, "require", report.SSLMode)
		assert.Equal(t, "AES-256-GCM", report.DataAtRestAlgorithm)

		// Test encryption & decryption helper
		encrypted, err := dataEncryptService.EncryptField("sensitive_user_pii_123")
		assert.NoError(t, err)
		assert.NotEqual(t, "sensitive_user_pii_123", encrypted)

		decrypted, err := dataEncryptService.DecryptField(encrypted)
		assert.NoError(t, err)
		assert.Equal(t, "sensitive_user_pii_123", decrypted)
	})

	// Test 5: Backup validation -> ENCRYPTED_BACKUP_ACTIVE
	t.Run("Test 5: Backup validation", func(t *testing.T) {
		posture := backupService.GetBackupPosture()

		assert.True(t, posture.BackupEnabled)
		assert.True(t, posture.EncryptionActive)
		assert.True(t, posture.RestoreTested)
		assert.Equal(t, "ENCRYPTED_BACKUP_ACTIVE", posture.Status)

		valid, status := backupService.ValidateBackupConfiguration(true, true)
		assert.True(t, valid)
		assert.Equal(t, "ENCRYPTED_BACKUP_ACTIVE", status)

		unencryptedValid, unencryptedStatus := backupService.ValidateBackupConfiguration(false, true)
		assert.False(t, unencryptedValid)
		assert.Equal(t, "UNENCRYPTED_BACKUP_REJECTED", unencryptedStatus)
	})

	t.Run("Data classification & Audit logging test", func(t *testing.T) {
		fields := dataClassService.GetClassifiedFields()
		assert.GreaterOrEqual(t, len(fields), 5)

		masked := dataClassService.MaskValue("RESTRICTED", "secret123")
		assert.Equal(t, "********", masked)

		auditLog := dbAuditService.LogQuery("test_user", "UPDATE", "incidents", "172.20.0.5", "SUCCESS", "UPDATE incidents SET status='CLOSED'")
		assert.Equal(t, "UPDATE", auditLog.Action)
		assert.Equal(t, "SUCCESS", auditLog.Result)

		logs := dbAuditService.GetAuditLogs()
		assert.GreaterOrEqual(t, len(logs), 1)
	})
}
