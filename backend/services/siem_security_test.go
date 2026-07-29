package services

import (
	"testing"

	"netsentinel-x-backend/models"

	"github.com/stretchr/testify/assert"
)

func TestSIEMSecuritySuite(t *testing.T) {
	auditChain := NewAuditChainService()
	severityService := NewEventSeverityService()
	eventService := NewSecurityEventService(auditChain, severityService)
	alertService := NewSecurityAlertService()
	threatEngine := NewThreatDetectionEngine(auditChain, alertService)
	timelineService := NewIncidentTimelineService(auditChain)

	// Test 1: Audit log creation -> EVENT_STORED
	t.Run("Test 1: Audit log creation", func(t *testing.T) {
		entry := eventService.CollectEvent(
			"LOGIN_SUCCESS",
			"USR-TEST-01",
			"TestAnalyst",
			"SECURITY_ANALYST",
			"192.168.1.50",
			"Linux PC",
			"Mumbai",
			"LOGIN",
			"Auth API",
		)

		assert.NotEmpty(t, entry.ID)
		assert.Equal(t, "LOGIN_SUCCESS", entry.EventType)
		assert.Equal(t, models.SeverityInfo, entry.Severity)
		assert.NotEmpty(t, entry.PreviousHash)
		assert.NotEmpty(t, entry.CurrentHash)
	})

	// Test 2: Hash chain validation -> CHAIN_VALID
	t.Run("Test 2: Hash chain validation", func(t *testing.T) {
		result := auditChain.VerifyChainIntegrity()

		assert.True(t, result.Valid, "Intact audit log chain must pass verification")
		assert.Equal(t, "CHAIN_VALID", result.Status)
		assert.Equal(t, -1, result.TamperedIndex)
		assert.GreaterOrEqual(t, result.TotalLogs, 4)
	})

	// Test 3: Modified log detection -> TAMPERING_DETECTED
	t.Run("Test 3: Modified log detection", func(t *testing.T) {
		// Tamper with log entry at index 1
		tampered := auditChain.InjectTamperingForTest(1)
		assert.True(t, tampered)

		result := auditChain.VerifyChainIntegrity()
		assert.False(t, result.Valid, "Tampered log entry must fail hash chain verification")
		assert.Equal(t, "TAMPERING_DETECTED", result.Status)
		assert.Equal(t, 1, result.TamperedIndex)
	})

	// Test 4: Brute force detection -> HIGH_ALERT_CREATED
	t.Run("Test 4: Brute force detection", func(t *testing.T) {
		targetIP := "198.51.100.99"
		var lastAlert *models.SIEMAlert

		for i := 0; i < 9; i++ {
			alert := threatEngine.EvaluateBruteForce(targetIP, "VictimUser")
			assert.Nil(t, alert, "Fewer than 10 failed logins should not fire Brute Force alert")
		}

		// 10th failed login attempt
		lastAlert = threatEngine.EvaluateBruteForce(targetIP, "VictimUser")
		assert.NotNil(t, lastAlert, "10th failed login attempt must fire HIGH Brute Force alert")
		assert.Equal(t, models.SeverityHigh, lastAlert.Severity)
		assert.Equal(t, "BRUTE_FORCE_ATTACK", lastAlert.Title)
		assert.Equal(t, models.AlertOpen, lastAlert.Status)
	})

	// Test 5: Privilege escalation detection -> CRITICAL_ALERT_CREATED
	t.Run("Test 5: Privilege escalation detection", func(t *testing.T) {
		alert := threatEngine.EvaluatePrivilegeEscalation("Unprivileged_User", "VIEW_ONLY", "/api/v2/admin/system/override")

		assert.NotNil(t, alert, "Unprivileged admin endpoint access must fire CRITICAL Privilege Escalation alert")
		assert.Equal(t, models.SeverityCritical, alert.Severity)
		assert.Equal(t, "PRIVILEGE_ESCALATION", alert.Title)
		assert.Equal(t, "Unprivileged_User", alert.AffectedUser)

		// Test timeline generation
		timeline := timelineService.GetTimeline()
		assert.GreaterOrEqual(t, len(timeline), 4)
	})
}
