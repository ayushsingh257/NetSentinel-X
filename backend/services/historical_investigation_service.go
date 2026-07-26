package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type HistoricalInvestigationService struct {
	mu     sync.RWMutex
	events []models.HistoricalEvent
	iocs   map[string]models.IOCHistory
}

func NewHistoricalInvestigationService() *HistoricalInvestigationService {
	s := &HistoricalInvestigationService{
		events: make([]models.HistoricalEvent, 0),
		iocs:   make(map[string]models.IOCHistory),
	}
	s.seedHistoricalData()
	return s
}

func (s *HistoricalInvestigationService) seedHistoricalData() {
	now := time.Now()

	s.events = []models.HistoricalEvent{
		{
			ID: "HE-001", EventType: "ALERT", Source: "185.220.101.45",
			Destination: "192.168.1.105", Protocol: "HTTPS", RiskScore: 95,
			MITRETechnique: "T1071.001", Description: "Outbound C2 beaconing detected via HTTPS to known malicious host.",
			Timestamp: now.Add(-45 * time.Minute), RelatedIOC: "185.220.101.45", RelatedIncident: "INC-2026-8001",
		},
		{
			ID: "HE-002", EventType: "IOC_MATCH", Source: "c2-command.malicious.net",
			Destination: "192.168.1.105", Protocol: "DNS", RiskScore: 90,
			MITRETechnique: "T1071.001", Description: "DNS query to known C2 domain. Matched active threat feed.",
			Timestamp: now.Add(-43 * time.Minute), RelatedIOC: "c2-command.malicious.net", RelatedIncident: "INC-2026-8001",
		},
		{
			ID: "HE-003", EventType: "UEBA_ANOMALY", Source: "192.168.1.105",
			Destination: "external", Protocol: "TLS", RiskScore: 88,
			MITRETechnique: "T1571", Description: "Abnormal port usage anomaly detected. Host behaviour deviated 3.4 sigma from 30-day baseline.",
			Timestamp: now.Add(-40 * time.Minute), RelatedIOC: "192.168.1.105",
		},
		{
			ID: "HE-004", EventType: "DETECTION", Source: "RULE-SIGMA-001",
			Destination: "192.168.1.105", Protocol: "DNS", RiskScore: 85,
			MITRETechnique: "T1071.001", Description: "Custom detection rule triggered: DNS Tunneling pattern identified in request payload.",
			Timestamp: now.Add(-35 * time.Minute), RelatedIncident: "INC-2026-8001",
		},
		{
			ID: "HE-005", EventType: "INCIDENT", Source: "Automated Correlation Engine",
			Destination: "INC-2026-8001", Protocol: "N/A", RiskScore: 98,
			MITRETechnique: "T1071.001", Description: "Incident INC-2026-8001 created: Automated C2 Beaconing Event detected on Finance VLAN-10.",
			Timestamp: now.Add(-30 * time.Minute), RelatedIncident: "INC-2026-8001",
		},
		{
			ID: "HE-006", EventType: "TRAFFIC", Source: "10.0.0.42",
			Destination: "8.8.8.8", Protocol: "DNS", RiskScore: 25,
			MITRETechnique: "", Description: "Normal DNS resolution to Google DNS. Low risk baseline traffic.",
			Timestamp: now.Add(-2 * time.Hour),
		},
	}

	ioc1 := models.IOCHistory{
		IOC: "185.220.101.45", IOCType: "IP",
		FirstSeen: now.Add(-72 * time.Hour), LastSeen: now.Add(-30 * time.Minute),
		TotalOccurrences: 7, RiskTrend: "INCREASING",
		PreviousIncidents: []string{"INC-2026-8001"},
		RelatedCampaigns:  []string{"APT-CampX-C2-Cluster"},
		SeverityHistory:   []int{60, 72, 80, 88, 90, 94, 95},
	}

	ioc2 := models.IOCHistory{
		IOC: "c2-command.malicious.net", IOCType: "DOMAIN",
		FirstSeen: now.Add(-48 * time.Hour), LastSeen: now.Add(-43 * time.Minute),
		TotalOccurrences: 5, RiskTrend: "STABLE",
		PreviousIncidents: []string{"INC-2026-8001"},
		RelatedCampaigns:  []string{"APT-CampX-C2-Cluster"},
		SeverityHistory:   []int{85, 88, 90, 90, 92},
	}

	s.iocs[ioc1.IOC] = ioc1
	s.iocs[ioc2.IOC] = ioc2
}

func (s *HistoricalInvestigationService) SearchEvents(query string) []models.HistoricalEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()

	q := strings.ToLower(query)
	var results []models.HistoricalEvent
	for _, e := range s.events {
		if strings.Contains(strings.ToLower(e.Source), q) ||
			strings.Contains(strings.ToLower(e.Destination), q) ||
			strings.Contains(strings.ToLower(e.Description), q) ||
			strings.Contains(strings.ToLower(e.MITRETechnique), q) ||
			strings.Contains(strings.ToLower(e.Protocol), q) ||
			strings.Contains(strings.ToLower(e.EventType), q) {
			results = append(results, e)
		}
	}
	if len(results) == 0 {
		return s.events
	}
	return results
}

func (s *HistoricalInvestigationService) GetAllEvents() []models.HistoricalEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.events
}

func (s *HistoricalInvestigationService) GetIOCHistory(ioc string) (models.IOCHistory, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	h, exists := s.iocs[ioc]
	return h, exists
}

func (s *HistoricalInvestigationService) GetReplaySequence(incidentID string) []models.AttackReplayEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return []models.AttackReplayEvent{
		{StepIndex: 1, NodeType: "EXTERNAL_IP", Label: "185.220.101.45 (C2 Host)", Description: "Initial outbound connection observed from internal workstation.", Timestamp: time.Now().Add(-45 * time.Minute), RiskScore: 96},
		{StepIndex: 2, NodeType: "DOMAIN", Label: "c2-command.malicious.net", Description: "DNS query to C2 domain matched threat intelligence feed.", Timestamp: time.Now().Add(-43 * time.Minute), RiskScore: 92},
		{StepIndex: 3, NodeType: "INTERNAL_HOST", Label: "192.168.1.105 (Workstation-A)", Description: "Compromised host initiated repeated TLS beaconing over port 443.", Timestamp: time.Now().Add(-40 * time.Minute), RiskScore: 90},
		{StepIndex: 4, NodeType: "DETECTION_RULE", Label: "RULE-SIGMA-001 (DNS Tunneling)", Description: "Sigma rule fired on abnormal DNS query payload size and frequency.", Timestamp: time.Now().Add(-35 * time.Minute), RiskScore: 85},
		{StepIndex: 5, NodeType: "INCIDENT", Label: "INC-2026-8001 (C2 Event)", Description: "Incident case automatically created with CRITICAL severity and P1 SLA.", Timestamp: time.Now().Add(-30 * time.Minute), RiskScore: 98},
	}
}

func (s *HistoricalInvestigationService) RunThreatHuntQuery(query string) models.ThreatHuntResult {
	s.mu.RLock()
	defer s.mu.RUnlock()

	q := strings.ToLower(query)

	// AI Threat Hunt Hypothesis Generation
	hypothesis := fmt.Sprintf("AI Threat Hunting Analysis: Hypothesis generated from query '%s'. Pattern analysis across historical telemetry suggests possible persistent threat actor activity with C2 infrastructure interaction.", query)
	riskExplanation := "Correlated telemetry across 6 data sources (DPI packets, UEBA baselines, detection rules, threat intelligence feeds, incident cases, and MITRE ATT&CK mappings). High-confidence match pattern identified."

	investigationSteps := []string{
		"Isolate all internal hosts communicating with identified IOC within the detected window.",
		"Pivot to UEBA module — review 30-day behaviour baseline for all affected entities.",
		"Cross-reference detection rule RULE-SIGMA-001 execution count for the previous 7 days.",
		"Review Threat Intelligence Fusion enrichment results for all correlated IOCs.",
		"Reconstruct full attack timeline using Attack Graph replay for INC-2026-8001.",
	}

	var matchedEvents []models.HistoricalEvent
	for _, e := range s.events {
		if strings.Contains(strings.ToLower(e.Source), q) ||
			strings.Contains(strings.ToLower(e.Description), q) ||
			strings.Contains(strings.ToLower(e.MITRETechnique), q) ||
			q == "" {
			matchedEvents = append(matchedEvents, e)
		}
	}

	var iocMatches []models.IOCHistory
	for _, ioc := range s.iocs {
		if strings.Contains(strings.ToLower(ioc.IOC), q) || q == "" {
			iocMatches = append(iocMatches, ioc)
		}
	}

	return models.ThreatHuntResult{
		QueryText:          query,
		Hypothesis:         hypothesis,
		MatchedEvents:      matchedEvents,
		IOCMatches:         iocMatches,
		ReplaySequence:     s.GetReplaySequence("INC-2026-8001"),
		RiskExplanation:    riskExplanation,
		InvestigationSteps: investigationSteps,
		ConfidenceScore:    92,
	}
}
