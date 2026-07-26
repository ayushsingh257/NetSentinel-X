package services

import (
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type ReportService struct {
	mu         sync.RWMutex
	reports    map[string]models.Report
	frameworks map[string]models.ComplianceFramework
	templates  []models.ReportTemplate
	schedulers []models.ScheduledReport
}

func NewReportService() *ReportService {
	s := &ReportService{
		reports:    make(map[string]models.Report),
		frameworks: make(map[string]models.ComplianceFramework),
		templates:  make([]models.ReportTemplate, 0),
		schedulers: make([]models.ScheduledReport, 0),
	}
	s.seedReportData()
	return s
}

func (s *ReportService) seedReportData() {
	now := time.Now()

	rep1 := models.Report{
		ID:             "REP-2026-001",
		Title:          "Q3 Executive Security Posture & Risk Assessment",
		Type:           "EXECUTIVE",
		AISummary:      "During the reporting period, 2 critical C2 beaconing incidents were isolated with zero operational downtime. Overall enterprise security posture score remains high at 94/100 across network perimeters.",
		BusinessImpact: "Zero data breach loss. Isolated suspicious outbound HTTPS traffic on VLAN-10 within 10 minutes of initial detection.",
		SecurityScore:  94,
		ThreatOverview: "Analyzed 1.4M network packets. Identified 2 C2 beaconing anomalies, 1 port scan attempt, and 0 ransomware indicators.",
		ControlCoverageMap: map[string]int{
			"Access Control":      98,
			"Telemetry Logging":   100,
			"Incident Response":   95,
			"Threat Intelligence": 92,
		},
		ComplianceStatusMap: map[string]string{
			"SOC 2 Type II":  "COMPLIANT",
			"ISO 27001:2022": "COMPLIANT",
			"HIPAA Security": "COMPLIANT",
		},
		GeneratedAt:            now.Add(-2 * time.Hour),
		GeneratedBy:            "AI Copilot Security Analyst",
		ExportFormatsAvailable: []string{"PDF", "HTML", "MARKDOWN", "JSON"},
		EvidenceItemsCount:     14,
	}

	fwSOC2 := models.ComplianceFramework{
		Framework:       "SOC2",
		OverallStatus:   "COMPLIANT",
		PassedControls:  24,
		TotalControls:   24,
		ComplianceScore: 100,
		ControlGaps:     []string{},
	}

	fwISO := models.ComplianceFramework{
		Framework:       "ISO27001",
		OverallStatus:   "COMPLIANT",
		PassedControls:  92,
		TotalControls:   94,
		ComplianceScore: 97,
		ControlGaps:     []string{"A.12.6.1 Vulnerability Management Weekly Cadence"},
	}

	fwHIPAA := models.ComplianceFramework{
		Framework:       "HIPAA",
		OverallStatus:   "COMPLIANT",
		PassedControls:  18,
		TotalControls:   18,
		ComplianceScore: 100,
		ControlGaps:     []string{},
	}

	s.reports[rep1.ID] = rep1

	s.frameworks[fwSOC2.Framework] = fwSOC2
	s.frameworks[fwISO.Framework] = fwISO
	s.frameworks[fwHIPAA.Framework] = fwHIPAA

	s.templates = []models.ReportTemplate{
		{ID: "TMPL-EXEC", Name: "Executive Security Summary", Description: "High-level risk & CISO summary for leadership", Category: "EXECUTIVE"},
		{ID: "TMPL-SOC", Name: "SOC Daily Operational Brief", Description: "Daily alert trends, traffic metrics & analyst performance", Category: "OPERATIONAL"},
		{ID: "TMPL-COMP", Name: "Enterprise Compliance Audit Report", Description: "SOC 2, ISO 27001 & HIPAA control mapping report", Category: "COMPLIANCE"},
	}

	s.schedulers = []models.ScheduledReport{
		{ID: "SCH-01", Title: "Daily SOC Briefing", Frequency: "DAILY", Recipients: "soc-team@enterprise.sec", NextRun: now.Add(12 * time.Hour), Status: "ACTIVE"},
		{ID: "SCH-02", Title: "Monthly Executive CISO Summary", Frequency: "MONTHLY", Recipients: "ciso@enterprise.sec", NextRun: now.Add(240 * time.Hour), Status: "ACTIVE"},
	}
}

func (s *ReportService) GetReports() []models.Report {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []models.Report
	for _, r := range s.reports {
		list = append(list, r)
	}
	return list
}

func (s *ReportService) GetComplianceFrameworks() map[string]models.ComplianceFramework {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.frameworks
}

func (s *ReportService) GenerateReport(repType, title string) models.Report {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	repID := fmt.Sprintf("REP-2026-%d", now.Unix()%10000)

	rep := models.Report{
		ID:             repID,
		Title:          title,
		Type:           repType,
		AISummary:      fmt.Sprintf("Automated %s report synthesized from real-time DPI telemetry, 12-tactic MITRE coverage, and threat intelligence feeds.", repType),
		BusinessImpact: "No critical security breaches. All detected anomalies were triaged within SLA compliance targets.",
		SecurityScore:  95,
		ThreatOverview: "Analyzed live network sessions and protocol dissections with 0 unhandled alerts.",
		ControlCoverageMap: map[string]int{
			"Access Control":    100,
			"Telemetry Logging": 100,
		},
		ComplianceStatusMap: map[string]string{
			"SOC 2 Type II":  "COMPLIANT",
			"ISO 27001:2022": "COMPLIANT",
		},
		GeneratedAt:            now,
		GeneratedBy:            "Lead Security Architect",
		ExportFormatsAvailable: []string{"PDF", "HTML", "MARKDOWN", "JSON"},
		EvidenceItemsCount:     10,
	}

	s.reports[repID] = rep
	return rep
}

func (s *ReportService) ExportReportHTML(repID string) string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	rep, exists := s.reports[repID]
	if !exists {
		return "<h1>Report Not Found</h1>"
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head><title>%s</title><style>body{font-family:sans-serif;background:#000;color:#fff;padding:20px;}h1{color:#22d3ee;}</style></head>
<body>
<h1>NetSentinel-X Security Report: %s</h1>
<p><strong>Type:</strong> %s | <strong>Score:</strong> %d/100</p>
<hr/>
<h2>Executive Summary</h2>
<p>%s</p>
<h2>Business Impact</h2>
<p>%s</p>
</body>
</html>`, rep.Title, rep.Title, rep.Type, rep.SecurityScore, rep.AISummary, rep.BusinessImpact)
}
