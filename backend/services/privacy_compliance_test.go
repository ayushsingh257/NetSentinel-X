package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPIIDetection(t *testing.T) {
	piiService := NewPIIDetectionService()
	sampleText := "User john.doe@example.com connected from 192.168.1.50 with phone 9876543210"

	findings, found := piiService.DetectPII(sampleText, "unit_test_log")
	assert.True(t, found)
	assert.NotEmpty(t, findings)
	assert.Equal(t, "PII_FOUND", findings[0].Status)

	hasEmail := false
	for _, f := range findings {
		if f.Type == "EMAIL" && f.Value == "john.doe@example.com" {
			hasEmail = true
			break
		}
	}
	assert.True(t, hasEmail)
}

func TestEmailMasking(t *testing.T) {
	maskService := NewDataMaskingService()

	rawEmail := "example@test.com"
	maskedEmail := maskService.MaskEmail(rawEmail)
	assert.Equal(t, "e*****@test.com", maskedEmail)

	rawPhone := "9876543210"
	maskedPhone := maskService.MaskPhone(rawPhone)
	assert.Equal(t, "******3210", maskedPhone)

	rawIP := "192.168.1.10"
	maskedIP := maskService.MaskIP(rawIP)
	assert.Equal(t, "192.168.xxx.xxx", maskedIP)
}

func TestClassificationAssignment(t *testing.T) {
	clsService := NewDataClassificationService()

	rec, err := clsService.ClassifyResource("db.users_table", "DATABASE_TABLE", "RESTRICTED", "SECURITY_ADMIN", "Contains credentials and personal data")
	assert.NoError(t, err)
	assert.NotNil(t, rec)
	assert.Equal(t, "RESTRICTED", rec.ClassificationLevel)

	stats := clsService.GetStats()
	assert.GreaterOrEqual(t, stats.RestrictedCount, 1)
}

func TestRetentionExpiry(t *testing.T) {
	retService := NewDataRetentionService()

	// Temp data retention is 30 days. Test age 45 days.
	status, expired, err := retService.CheckExpirations("TEMP_DATA", 45)
	assert.NoError(t, err)
	assert.True(t, expired)
	assert.Equal(t, "DATA_EXPIRATION_TRIGGERED", status)
}

func TestComplianceScoreCalculation(t *testing.T) {
	clsService := NewDataClassificationService()
	piiService := NewPIIDetectionService()

	findings := piiService.GetFindings()
	assert.NotEmpty(t, findings)

	stats := clsService.GetStats()
	assert.Greater(t, stats.TotalResources, 0)
	assert.Equal(t, 5, stats.TotalResources)
}
