package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"netsentinel-x-backend/models"
)

func TestAISecurityAnalystCapabilities(t *testing.T) {
	service := NewAISecurityAnalystService(nil)

	assert.Equal(t, "NetSentinel-AI-Engine-v2", service.GetProviderName())

	// 1. Explain Alert
	alertResp, err := service.ExplainAlert(models.ExplainAlertRequest{
		AlertID:    "ALT-101",
		Title:      "Brute Force Authentication",
		Severity:   "HIGH",
		Source:     "192.168.1.50",
		RawPayload: "login_failed_attempts=15",
	})
	assert.NoError(t, err)
	assert.Equal(t, "ALT-101", alertResp.AlertID)
	assert.NotEmpty(t, alertResp.Summary)
	assert.NotEmpty(t, alertResp.RootCause)

	// 2. Summarize Threat
	threatResp, err := service.SummarizeThreat(models.SummarizeThreatRequest{
		ThreatID:      "TRT-202",
		ThreatType:    "Malware Beaconing",
		Indicators:    []string{"10.0.0.99", "malicious-c2.com"},
		AffectedHosts: []string{"srv-prod-01"},
	})
	assert.NoError(t, err)
	assert.Equal(t, "TRT-202", threatResp.ThreatID)
	assert.NotEmpty(t, threatResp.ExecutiveSummary)

	// 3. Summarize Incident
	incResp, err := service.SummarizeIncident(models.SummarizeIncidentRequest{
		IncidentID:    "INC-303",
		Title:         "Unauthorized Admin Privilege Escalation",
		RelatedAlerts: []string{"ALT-101", "ALT-102"},
		Scope:         "Staging Network",
	})
	assert.NoError(t, err)
	assert.Equal(t, "INC-303", incResp.IncidentID)
	assert.NotEmpty(t, incResp.ContainmentPlan)

	// 4. Explain Timeline
	tlResp, err := service.ExplainTimeline(models.ExplainTimelineRequest{
		TimelineID: "TL-404",
		EventChain: []string{"Recon", "Auth Failure", "Exploit", "Persistence"},
		TimeRange:  "Last 2 Hours",
	})
	assert.NoError(t, err)
	assert.Equal(t, "TL-404", tlResp.TimelineID)

	// 5. Explain IOC
	iocResp, err := service.ExplainIOC(models.ExplainIOCRequest{
		IOCValue: "185.220.101.5",
		IOCType:  "IP",
	})
	assert.NoError(t, err)
	assert.Equal(t, "185.220.101.5", iocResp.IOCValue)
	assert.True(t, iocResp.RecommendedBlock)

	// 6. Explain MITRE
	mitreResp, err := service.ExplainMITRE(models.ExplainMITRERequest{
		TechniqueID:   "T1059",
		TechniqueName: "Command and Scripting Interpreter",
	})
	assert.NoError(t, err)
	assert.Equal(t, "T1059", mitreResp.TechniqueID)

	// 7. Threat Hunting Query
	huntResp, err := service.ThreatHuntingQuery(models.ThreatHuntingQueryRequest{
		QueryPrompt: "Find powershell execution with encoded command",
		TargetScope: "All Windows Endpoints",
	})
	assert.NoError(t, err)
	assert.NotEmpty(t, huntResp.GeneratedQuery)

	// 8. Investigation Assistance
	invResp, err := service.InvestigateAssistance(models.InvestigationAssistanceRequest{
		IncidentID:   "INC-303",
		CurrentState: "Triage Phase",
	})
	assert.NoError(t, err)
	assert.NotEmpty(t, invResp.SuggestedNextSteps)
}
