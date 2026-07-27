package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type AuditService struct {
	mu   sync.RWMutex
	logs []models.AuditLog
}

func NewAuditService() *AuditService {
	s := &AuditService{
		logs: make([]models.AuditLog, 0),
	}
	s.seedAuditLogs()
	return s
}

func (s *AuditService) seedAuditLogs() {
	now := time.Now()

	s.logs = []models.AuditLog{
		{
			ID:         "AUD-1001",
			Timestamp:  now.Add(-45 * time.Minute),
			UserID:     "USR-001",
			Username:   "Ayush (Lead Analyst)",
			Role:       "SOC_ADMIN",
			Action:     "THREAT_HUNT_EXECUTED",
			Category:   "THREAT_HUNT",
			Resource:   "ThreatHuntingWorkspace",
			ResourceID: "HUNT-9901",
			IPAddress:  "192.168.1.10",
			UserAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			Severity:   "MEDIUM",
			Status:     "SUCCESS",
			Metadata:   map[string]interface{}{"query": "Find all C2 beaconing events", "confidence": 92},
		},
		{
			ID:         "AUD-1002",
			Timestamp:  now.Add(-30 * time.Minute),
			UserID:     "USR-002",
			Username:   "SOC Analyst",
			Role:       "ANALYST",
			Action:     "WORKFLOW_APPROVED",
			Category:   "WORKFLOW",
			Resource:   "WorkflowAutomation",
			ResourceID: "APP-101",
			IPAddress:  "192.168.1.15",
			UserAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			Severity:   "HIGH",
			Status:     "SUCCESS",
			Metadata:   map[string]interface{}{"workflow_name": "Ransomware & Lateral Movement Containment", "action": "SIMULATED_HOST_ISOLATION"},
		},
		{
			ID:         "AUD-1003",
			Timestamp:  now.Add(-20 * time.Minute),
			UserID:     "SYSTEM",
			Username:   "Automated Correlation Engine",
			Role:       "SYSTEM_ENGINE",
			Action:     "INCIDENT_CREATED",
			Category:   "INCIDENT",
			Resource:   "AIIncidentDesk",
			ResourceID: "INC-2026-8001",
			IPAddress:  "127.0.0.1",
			UserAgent:  "NetSentinel-Engine/2.0",
			Severity:   "CRITICAL",
			Status:     "SUCCESS",
			Metadata:   map[string]interface{}{"title": "C2 Beaconing Event", "priority": "P1"},
		},
		{
			ID:         "AUD-1004",
			Timestamp:  now.Add(-10 * time.Minute),
			UserID:     "USR-001",
			Username:   "Ayush (Lead Analyst)",
			Role:       "SOC_ADMIN",
			Action:     "REPORT_GENERATED",
			Category:   "REPORT",
			Resource:   "ExecutiveReporting",
			ResourceID: "REP-2026-001",
			IPAddress:  "192.168.1.10",
			UserAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			Severity:   "LOW",
			Status:     "SUCCESS",
			Metadata:   map[string]interface{}{"format": "PDF", "framework": "SOC2"},
		},
		{
			ID:         "AUD-1005",
			Timestamp:  now.Add(-5 * time.Minute),
			UserID:     "USR-003",
			Username:   "Security Engineer",
			Role:       "DETECTION_ENG",
			Action:     "RULE_UPDATED",
			Category:   "DETECTION",
			Resource:   "DetectionStudio",
			ResourceID: "RULE-SIGMA-001",
			IPAddress:  "192.168.1.20",
			UserAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			Severity:   "MEDIUM",
			Status:     "SUCCESS",
			Metadata:   map[string]interface{}{"rule_name": "DNS Tunneling Detection", "status": "ACTIVE"},
		},
	}
}

func (s *AuditService) LogEvent(event models.AuditLog) models.AuditLog {
	s.mu.Lock()
	defer s.mu.Unlock()

	if event.ID == "" {
		event.ID = fmt.Sprintf("AUD-%d", time.Now().UnixNano()%100000)
	}
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}
	if event.Status == "" {
		event.Status = "SUCCESS"
	}
	if event.Severity == "" {
		event.Severity = "INFO"
	}

	s.logs = append([]models.AuditLog{event}, s.logs...)
	return event
}

func (s *AuditService) GetLogs(limit int) []models.AuditLog {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if limit <= 0 || limit > len(s.logs) {
		return s.logs
	}
	return s.logs[:limit]
}

func (s *AuditService) SearchLogs(query, category, severity, user string) []models.AuditLog {
	s.mu.RLock()
	defer s.mu.RUnlock()

	q := strings.ToLower(query)
	cat := strings.ToUpper(category)
	sev := strings.ToUpper(severity)
	usr := strings.ToLower(user)

	var results []models.AuditLog
	for _, l := range s.logs {
		match := true

		if q != "" {
			inAction := strings.Contains(strings.ToLower(l.Action), q)
			inUser := strings.Contains(strings.ToLower(l.Username), q)
			inRes := strings.Contains(strings.ToLower(l.Resource), q)
			inCat := strings.Contains(strings.ToLower(l.Category), q)
			if !inAction && !inUser && !inRes && !inCat {
				match = false
			}
		}

		if match && cat != "" && l.Category != cat {
			match = false
		}

		if match && sev != "" && l.Severity != sev {
			match = false
		}

		if match && usr != "" && !strings.Contains(strings.ToLower(l.Username), usr) && !strings.Contains(strings.ToLower(l.UserID), usr) {
			match = false
		}

		if match {
			results = append(results, l)
		}
	}
	return results
}

func (s *AuditService) ExportLogs() string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var sb strings.Builder
	sb.WriteString("ID,Timestamp,Username,Role,Action,Category,Resource,Severity,Status\n")
	for _, l := range s.logs {
		sb.WriteString(fmt.Sprintf("%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
			l.ID, l.Timestamp.Format(time.RFC3339), l.Username, l.Role, l.Action, l.Category, l.Resource, l.Severity, l.Status))
	}
	return sb.String()
}
