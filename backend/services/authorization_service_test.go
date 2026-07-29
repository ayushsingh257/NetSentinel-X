package services

import (
	"testing"

	"netsentinel-x-backend/models"

	"github.com/stretchr/testify/assert"
)

func TestAuthorizationService_EvaluateAccess(t *testing.T) {
	auditService := NewAuditService()
	secAuditService := NewSecurityAuditService()
	privMon := NewPrivilegeMonitorService(secAuditService, auditService)
	authz := NewAuthorizationService(auditService, privMon)

	t.Run("Test 1: SuperAdmin CREATE_RULES -> ALLOW", func(t *testing.T) {
		allowed, reason := authz.EvaluateAccess("admin_user", "SUPER_ADMIN", "CREATE_RULES", "/api/v2/detections/rules")
		assert.True(t, allowed)
		assert.Equal(t, "PERMITTED_BY_ROLE_POLICY", reason)
	})

	t.Run("Test 2: ViewOnly DELETE / CREATE -> DENY", func(t *testing.T) {
		allowed, reason := authz.EvaluateAccess("viewer_user", string(models.RoleViewOnly), "CREATE_INCIDENTS", "/api/v2/incidents/create")
		assert.False(t, allowed)
		assert.Equal(t, "INSUFFICIENT_PRIVILEGES", reason)

		// Check privilege violation was logged
		viol := privMon.GetViolations()
		assert.True(t, len(viol) > 0)
		assert.Equal(t, "viewer_user", viol[0].Username)
	})

	t.Run("Test 3: Analyst RUN_THREAT_HUNTS -> ALLOW", func(t *testing.T) {
		allowed, reason := authz.EvaluateAccess("analyst_user", string(models.RoleSecurityAnalyst), "RUN_THREAT_HUNTS", "/api/v2/hunting/query")
		assert.True(t, allowed)
		assert.Equal(t, "PERMITTED_BY_ROLE_POLICY", reason)
	})

	t.Run("Test 4: Analyst SYSTEM_CONFIGURATION -> DENY", func(t *testing.T) {
		allowed, reason := authz.EvaluateAccess("analyst_user", string(models.RoleSecurityAnalyst), "SYSTEM_CONFIGURATION", "/api/v2/security/sessions/revoke")
		assert.False(t, allowed)
		assert.Equal(t, "INSUFFICIENT_PRIVILEGES", reason)

		// Check critical violation recorded
		viol := privMon.GetViolations()
		assert.True(t, len(viol) > 0)
		assert.Equal(t, "SYSTEM_CONFIGURATION", viol[0].Action)
	})

	t.Run("Test 5: Audit Event Generated for Denied Access", func(t *testing.T) {
		logs := auditService.GetLogs(10)
		assert.True(t, len(logs) > 0)
		foundDenied := false
		for _, l := range logs {
			if l.Status == "DENIED" {
				foundDenied = true
				break
			}
		}
		assert.True(t, foundDenied, "Expected at least one DENIED audit log entry")
	})
}
