package services

import (
	"crypto/sha256"
	"encoding/hex"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBackupCreation(t *testing.T) {
	bs := NewBackupService()
	rawPayload := []byte("netsentinel-production-db-full-snapshot-test-data")

	rec, err := bs.CreateBackup("FULL", rawPayload)
	assert.NoError(t, err)
	assert.NotNil(t, rec)
	assert.Equal(t, "FULL", rec.BackupType)
	assert.Equal(t, "ENCRYPTED_AES256", rec.EncryptionStatus)
	assert.Equal(t, "RESTORE_READY", rec.RestoreStatus)

	expectedHash := sha256.Sum256(rawPayload)
	assert.Equal(t, hex.EncodeToString(expectedHash[:]), rec.IntegrityHash)
}

func TestBackupIntegrityVerification(t *testing.T) {
	bs := NewBackupService()
	rs := NewRestoreVerificationService(bs)

	rawPayload := []byte("valid-unmodified-database-backup-bytes")
	hash := sha256.Sum256(rawPayload)
	expectedHashStr := hex.EncodeToString(hash[:])

	status, err := rs.VerifyIntegrity("BKP-TEST-01", rawPayload, expectedHashStr)
	assert.NoError(t, err)
	assert.Equal(t, "BACKUP_VALID", status)
}

func TestModifiedBackupDetection(t *testing.T) {
	bs := NewBackupService()
	rs := NewRestoreVerificationService(bs)

	originalData := []byte("original-database-backup-payload")
	hashOriginal := sha256.Sum256(originalData)
	originalHashStr := hex.EncodeToString(hashOriginal[:])

	// Tampered byte payload
	tamperedData := []byte("original-database-backup-payload-TAMPERED-BYTE")

	status, err := rs.VerifyIntegrity("BKP-TEST-CORRUPT", tamperedData, originalHashStr)
	assert.Error(t, err)
	assert.Equal(t, "BACKUP_CORRUPTED", status)
}

func TestRestoreSimulation(t *testing.T) {
	bs := NewBackupService()
	rs := NewRestoreVerificationService(bs)

	rawPayload := []byte("netsentinel-production-db-full-snapshot-dump-v2.28")
	rec, err := bs.CreateBackup("FULL", rawPayload)
	assert.NoError(t, err)

	res, err := rs.SimulateRestore(rec.ID, rawPayload, false)
	assert.NoError(t, err)
	assert.NotNil(t, res)
	assert.Equal(t, "RESTORE_READY", res.Outcome)
	assert.Contains(t, res.Logs[len(res.Logs)-1], "RESTORE_READY")
}

func TestFailedDatabaseRecovery(t *testing.T) {
	bs := NewBackupService()
	rs := NewRestoreVerificationService(bs)

	rawPayload := []byte("netsentinel-production-db-full-snapshot-dump-v2.28")
	rec, err := bs.CreateBackup("FULL", rawPayload)
	assert.NoError(t, err)

	// Simulate database failure during restore
	res, err := rs.SimulateRestore(rec.ID, rawPayload, true)
	assert.Error(t, err)
	assert.NotNil(t, res)
	assert.Equal(t, "RECOVERY_FAILURE", res.Outcome)
	assert.Contains(t, res.Logs[len(res.Logs)-1], "RECOVERY_FAILURE")
}
