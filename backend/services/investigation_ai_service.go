package services

import (
	"fmt"
	"time"

	aimodels "netsentinel-x-backend/models/ai"
	"netsentinel-x-backend/models/events"
)

type InvestigationAIService struct{}

func NewInvestigationAIService() *InvestigationAIService {
	return &InvestigationAIService{}
}

func (s *InvestigationAIService) GenerateInvestigation(incidentID string) *aimodels.AIInvestigationDetails {
	now := time.Now().UTC()
	if incidentID == "" {
		incidentID = "INC-2026-9901"
	}

	return &aimodels.AIInvestigationDetails{
		IncidentID:      incidentID,
		IncidentSummary: fmt.Sprintf("Autonomous Incident Reconstruction [%s]: High-confidence multi-stage attack detected involving web vulnerability exploitation, privilege escalation, and attempted credential harvesting.", incidentID),
		AttackTimeline: []aimodels.TimelineEvent{
			{Timestamp: now.Add(-25 * time.Minute), Stage: "Initial Access", Description: "HTTP SQLi payload detected targeting Web-Server-01 (192.168.1.100)", Source: "DPI Engine"},
			{Timestamp: now.Add(-18 * time.Minute), Stage: "Execution", Description: "Abnormal PowerShell execution spawning sub-shell process PID 4820", Source: "EDR Agent"},
			{Timestamp: now.Add(-10 * time.Minute), Stage: "Credential Access", Description: "LSASS memory access attempt flagged by UEBA anomaly detector", Source: "UEBA Analytics"},
			{Timestamp: now.Add(-2 * time.Minute), Stage: "Command & Control", Description: "Outbound HTTPS beaconing to untrusted external IP (198.51.100.42)", Source: "NetSentinel-X Core"},
		},
		AffectedAssets: []string{"192.168.1.100 (Web-Server-01)", "192.168.1.105 (Workstation-A)", "10.0.0.1 (Gateway)"},
		RelatedEvents:  []string{events.GenerateUUID(), events.GenerateUUID(), events.GenerateUUID()},
		RecommendedActions: []string{
			"Isolate Web-Server-01 (192.168.1.100) from production VLAN.",
			"Revoke active SSO sessions for user 'admin_ayush'.",
			"Block egress traffic to 198.51.100.42 on border firewall.",
			"Export forensically signed audit chain log for legal compliance.",
		},
		GeneratedAt: now,
	}
}
