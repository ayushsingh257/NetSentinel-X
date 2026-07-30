package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDeploymentSecuritySuite(t *testing.T) {
	readinessService := NewProductionReadinessService()
	healthService := NewDeploymentHealthService()

	// Test 1: Debug mode enabled -> DEPLOYMENT_BLOCKED
	t.Run("Test 1: Debug mode enabled", func(t *testing.T) {
		status, posture := readinessService.EvaluateReadiness("development", true, true, true, true)

		assert.Equal(t, "DEPLOYMENT_BLOCKED", status)
		assert.Equal(t, "DEPLOYMENT_BLOCKED", posture.DeploymentReadiness)
		assert.True(t, posture.DebugMode)
		assert.Equal(t, "development", posture.Environment)
		assert.Less(t, posture.Score, 90)
	})

	// Test 2: HTTP without HTTPS -> TLS_SECURITY_FAILURE
	t.Run("Test 2: HTTP without HTTPS", func(t *testing.T) {
		status, posture := readinessService.EvaluateReadiness("production", false, false, true, true)

		assert.Equal(t, "TLS_SECURITY_FAILURE", status)
		assert.Equal(t, "TLS_SECURITY_FAILURE", posture.DeploymentReadiness)

		tlsPosture := readinessService.GetTLSPosture()
		assert.True(t, tlsPosture.HTTPSEnabled)
		assert.Equal(t, "TLS 1.3", tlsPosture.TLSVersion)
		assert.True(t, tlsPosture.HSTSEnabled)
	})

	// Test 3: Insecure cookie configuration -> COOKIE_SECURITY_FAILURE
	t.Run("Test 3: Insecure cookie configuration", func(t *testing.T) {
		status, posture := readinessService.EvaluateReadiness("production", false, true, false, true)

		assert.Equal(t, "COOKIE_SECURITY_FAILURE", status)
		assert.Equal(t, "COOKIE_SECURITY_FAILURE", posture.DeploymentReadiness)
	})

	// Test 4: Healthy production environment -> PRODUCTION_READY
	t.Run("Test 4: Healthy production environment", func(t *testing.T) {
		status, posture := readinessService.EvaluateReadiness("production", false, true, true, true)

		assert.Equal(t, "PRODUCTION_READY", status)
		assert.Equal(t, "PRODUCTION_READY", posture.DeploymentReadiness)
		assert.Equal(t, 98, posture.Score)
		assert.False(t, posture.DebugMode)
		assert.Equal(t, "production", posture.Environment)
		assert.Equal(t, "READY", posture.RollbackReadiness)
	})

	// Test 5: Failed database health check -> DEPLOYMENT_HEALTH_FAILURE
	t.Run("Test 5: Failed database health check", func(t *testing.T) {
		status, posture := readinessService.EvaluateReadiness("production", false, true, true, false)

		assert.Equal(t, "DEPLOYMENT_HEALTH_FAILURE", status)
		assert.Equal(t, "DEPLOYMENT_HEALTH_FAILURE", posture.DeploymentReadiness)

		score, services := healthService.GetHealth()
		assert.Equal(t, 98, score)
		assert.GreaterOrEqual(t, len(services), 5)

		rollback := healthService.GetRollbackStatus()
		assert.Equal(t, "READY", rollback.Readiness)
		assert.Equal(t, "v2.27.0-era27", rollback.ActiveVersion)
	})
}
