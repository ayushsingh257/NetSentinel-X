package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDevSecOpsAuditReportGeneration(t *testing.T) {
	service := NewSecurityAuditReportService()
	report := service.GetReport()

	assert.Equal(t, 98, report.OverallAuditScore)
	assert.Equal(t, 100, report.ZeroTrustScore)
	assert.Equal(t, 14, report.ThreatModelSummary.TotalThreatsIdentified)
	assert.Equal(t, 0, report.RiskDistribution.CriticalCount)
	assert.Equal(t, 0, report.RiskDistribution.HighCount)
	assert.NotEmpty(t, report.Findings)
	assert.NotEmpty(t, report.Recommendations)
}

func TestRunDevSecOpsAuditScan(t *testing.T) {
	service := NewSecurityAuditReportService()
	report, status := service.RunAudit()

	assert.Equal(t, "AUDIT_RUN_COMPLETE", status)
	assert.Equal(t, 98, report.OverallAuditScore)
	assert.Equal(t, 100, report.ZeroTrustScore)
}
