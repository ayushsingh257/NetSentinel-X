package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSecurityAuditExecution(t *testing.T) {
	auditService := NewSecurityAuditService()
	audits, status := auditService.ExecuteAudit()

	assert.Equal(t, "AUDIT_COMPLETE", status)
	assert.NotEmpty(t, audits)
	assert.GreaterOrEqual(t, len(audits), 10)

	for _, a := range audits {
		assert.Equal(t, "PASS", a.Status)
	}
}

func TestOWASPValidation(t *testing.T) {
	owaspService := NewOWASPValidationService()
	score, status := owaspService.ValidateOWASP()

	assert.Equal(t, "OWASP_PASS", status)
	assert.Equal(t, 100, score.OverallScore)
	assert.Equal(t, 10, score.PassedCategories)
	assert.Equal(t, 10, score.TotalCategories)
}

func TestVulnerabilityScan(t *testing.T) {
	vulnService := NewVulnerabilityAssessmentService()
	report, status := vulnService.AssessVulnerabilities()

	assert.Equal(t, "NO_CRITICAL_FINDINGS", status)
	assert.Equal(t, 0, report.CriticalCount)
	assert.Equal(t, 0, report.HighCount)
	assert.NotEmpty(t, report.Findings)
}

func TestAttackSimulation(t *testing.T) {
	simService := NewSecuritySimulationService()
	simulations, status := simService.RunSimulations()

	assert.Equal(t, "ATTACK_DETECTED", status)
	assert.NotEmpty(t, simulations)
	assert.GreaterOrEqual(t, len(simulations), 5)

	for _, sim := range simulations {
		assert.Equal(t, "ATTACK_DETECTED", sim.DetectionStatus)
	}
}

func TestSecurityScoreCalculation(t *testing.T) {
	scoreService := NewSecurityScoreService()
	score, rating := scoreService.CalculateScore()

	assert.Equal(t, "ENTERPRISE_READY", rating)
	assert.Equal(t, 98, score.OverallScore)
	assert.Equal(t, 20.0, score.IdentityScore)
	assert.Equal(t, 19.5, score.AppSecScore)
	assert.Equal(t, 19.5, score.InfraScore)
}
