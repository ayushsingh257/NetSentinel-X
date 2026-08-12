package ai

import (
	"context"
	"fmt"
	"strings"

	aimodels "netsentinel-x-backend/models/ai"
)

// DeterministicMockProvider provides intelligent fallback threat analysis without external API dependencies.
type DeterministicMockProvider struct{}

func NewDeterministicMockProvider() *DeterministicMockProvider {
	return &DeterministicMockProvider{}
}

func (p *DeterministicMockProvider) Name() string {
	return "DeterministicSOCEngine"
}

func (p *DeterministicMockProvider) AnalyzeThreat(ctx context.Context, req aimodels.ThreatAnalysisRequest) (*aimodels.ThreatAnalysisResponse, error) {
	sev := strings.ToLower(req.Severity)
	var risk float64 = 45.0
	var confidence float64 = 0.88
	classification := "Suspicious Activity"
	mitreTech := "T1059"
	mitreName := "Command and Scripting Interpreter"
	tactic := "Execution"

	if sev == "critical" {
		risk = 95.5
		confidence = 0.96
		classification = "Malware"
		mitreTech = "T1190"
		mitreName = "Exploit Public-Facing Application"
		tactic = "Initial Access"
	} else if sev == "high" {
		risk = 78.0
		confidence = 0.91
		classification = "Credential Abuse"
		mitreTech = "T1110"
		mitreName = "Brute Force"
		tactic = "Credential Access"
	} else if sev == "low" {
		risk = 22.0
		confidence = 0.82
		classification = "Network Reconnaissance"
		mitreTech = "T1046"
		mitreName = "Network Service Discovery"
		tactic = "Discovery"
	}

	return &aimodels.ThreatAnalysisResponse{
		Classification: classification,
		Confidence:     confidence,
		RiskScore:      risk,
		MITRE: aimodels.MITREMappingData{
			Tactic:      tactic,
			Technique:   mitreName,
			TechniqueID: mitreTech,
			Description: fmt.Sprintf("Automated correlation mapped event source '%s' to MITRE ATT&CK technique %s.", req.Source, mitreTech),
			Mitigations: []string{
				"Enforce multi-factor authentication (MFA) across exposed services.",
				"Isolate affected source IP via network ACLs.",
				"Deploy endpoint detection and response (EDR) containment rule.",
			},
		},
		Recommendations: []string{
			"Isolate affected host from internal VLAN.",
			"Perform immediate memory dump and process tree audit.",
			"Update firewall drop rules for identified remote addresses.",
		},
	}, nil
}

func (p *DeterministicMockProvider) ClassifyAlert(ctx context.Context, req aimodels.AlertClassifyRequest) (*aimodels.AlertClassifyResponse, error) {
	title := strings.ToLower(req.Title)
	category := "Suspicious Behaviour"
	fpProb := 0.12
	adj := "NO_CHANGE"
	priority := 65.0

	if strings.Contains(title, "malware") || strings.Contains(title, "ransomware") {
		category = "Malware"
		fpProb = 0.04
		adj = "ESCALATE_CRITICAL"
		priority = 98.0
	} else if strings.Contains(title, "phishing") {
		category = "Phishing"
		fpProb = 0.08
		priority = 85.0
	} else if strings.Contains(title, "brute") || strings.Contains(title, "login") {
		category = "Credential Abuse"
		fpProb = 0.15
		priority = 72.0
	} else if strings.Contains(title, "port") || strings.Contains(title, "scan") {
		category = "Network Attack"
		fpProb = 0.25
		priority = 45.0
	}

	return &aimodels.AlertClassifyResponse{
		Category:           category,
		FalsePositiveProb:  fpProb,
		SeverityAdjustment: adj,
		PriorityScore:      priority,
	}, nil
}

func (p *DeterministicMockProvider) GenerateCopilotResponse(ctx context.Context, prompt string, contextData map[string]interface{}) (*aimodels.CopilotResponse, error) {
	q := strings.ToLower(prompt)
	answer := "Based on real-time event correlation and SOC intelligence rules, this activity indicates automated external reconnaissance."
	recs := []string{
		"Block originating IP block at firewall boundary.",
		"Audit authentication logs for successful compromises.",
	}
	techniques := []string{"T1046: Network Service Discovery", "T1110: Brute Force"}

	if strings.Contains(q, "incident") || strings.Contains(q, "what happened") {
		answer = "Incident Investigation Summary: The DPI engine detected anomalous TCP traffic targeting sensitive service ports, followed by automated alert enrichment and risk escalation."
		recs = []string{
			"Review attached IOC indicators against threat intelligence feeds.",
			"Invoke automated SOAR containment playbook PB-9901.",
		}
		techniques = []string{"T1190: Exploit Public-Facing Application", "T1059: Command Interpreter"}
	} else if strings.Contains(q, "contain") || strings.Contains(q, "mitigate") {
		answer = "Containment Playbook Guidance: 1. Isolate the target workstation using network micro-segmentation. 2. Revoke active JWT sessions. 3. Rotate compromised credential hashes."
	}

	return &aimodels.CopilotResponse{
		Answer:             answer,
		Confidence:         0.94,
		RelatedTechniques:  techniques,
		RecommendedActions: recs,
	}, nil
}
