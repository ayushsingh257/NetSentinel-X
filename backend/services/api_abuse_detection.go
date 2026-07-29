package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type APIAbuseEvent struct {
	ID          string    `json:"id"`
	AbuseType   string    `json:"abuse_type"` // ENUMERATION, CREDENTIAL_BURST, TOKEN_ABUSE
	SourceIP    string    `json:"source_ip"`
	TargetPath  string    `json:"target_path"`
	Severity    string    `json:"severity"`
	ActionTaken string    `json:"action_taken"`
	Timestamp   time.Time `json:"timestamp"`
	Description string    `json:"description"`
}

type APIAbuseDetectionEngine struct {
	mu           sync.RWMutex
	abuseEvents  []APIAbuseEvent
	secAudit     *SecurityAuditService
	auditLogger  *AuditService
	scanKeywords []string
}

func NewAPIAbuseDetectionEngine(secAudit *SecurityAuditService, audit *AuditService) *APIAbuseDetectionEngine {
	e := &APIAbuseDetectionEngine{
		abuseEvents: make([]APIAbuseEvent, 0),
		secAudit:    secAudit,
		auditLogger: audit,
		scanKeywords: []string{
			"/admin", "/test", "/debug", "/env", "/.env", "/config", "/backup", "/wp-admin", "/actuator", "/swagger",
		},
	}
	e.seedEvents()
	return e
}

func (e *APIAbuseDetectionEngine) seedEvents() {
	now := time.Now()
	e.abuseEvents = []APIAbuseEvent{
		{
			ID:          "ABUSE-701",
			AbuseType:   "ENDPOINT_ENUMERATION",
			SourceIP:    "10.0.0.15",
			TargetPath:  "/api/v2/admin",
			Severity:    "HIGH",
			ActionTaken: "RATE_LIMITED",
			Timestamp:   now.Add(-15 * time.Minute),
			Description: "High-frequency endpoint scanning detected targeting sensitive debug paths",
		},
		{
			ID:          "ABUSE-702",
			AbuseType:   "CREDENTIAL_BURST",
			SourceIP:    "185.220.101.5",
			TargetPath:  "/login",
			Severity:    "CRITICAL",
			ActionTaken: "IP_BLOCKED",
			Timestamp:   now.Add(-30 * time.Minute),
			Description: "Brute-force credential burst detected (52 failed logins within 60 seconds)",
		},
	}
}

// InspectRequest analyzes path, IP, and status code for API abuse signatures.
func (e *APIAbuseDetectionEngine) InspectRequest(ip, path string, statusCode int) *APIAbuseEvent {
	e.mu.Lock()
	defer e.mu.Unlock()

	normPath := strings.ToLower(path)
	var abuseType string
	var severity string
	var action string

	for _, kw := range e.scanKeywords {
		if strings.Contains(normPath, kw) {
			abuseType = "ENDPOINT_ENUMERATION"
			severity = "HIGH"
			action = "RATE_LIMITED"
			break
		}
	}

	if abuseType == "" {
		return nil
	}

	evt := APIAbuseEvent{
		ID:          fmt.Sprintf("ABUSE-%d", time.Now().UnixNano()%100000),
		AbuseType:   abuseType,
		SourceIP:    ip,
		TargetPath:  path,
		Severity:    severity,
		ActionTaken: action,
		Timestamp:   time.Now(),
		Description: fmt.Sprintf("API abuse detected (%s) targeting '%s' from IP %s", abuseType, path, ip),
	}

	e.abuseEvents = append([]APIAbuseEvent{evt}, e.abuseEvents...)

	// Integrate with Era 14 Observability via AuditLogger
	if e.auditLogger != nil {
		e.auditLogger.LogEvent(models.AuditLog{
			Timestamp:  time.Now(),
			UserID:     "SYSTEM_ABUSE_ENGINE",
			Username:   "API Abuse Scanner",
			Role:       "SYSTEM",
			Action:     fmt.Sprintf("API_ABUSE_%s", abuseType),
			Category:   "SECURITY",
			Resource:   path,
			ResourceID: evt.ID,
			Severity:   severity,
			Status:     "BLOCKED",
			Metadata: map[string]interface{}{
				"source_ip":    ip,
				"action_taken": action,
			},
		})
	}

	return &evt
}

// GetAbuseEvents returns logged abuse detection events.
func (e *APIAbuseDetectionEngine) GetAbuseEvents() []APIAbuseEvent {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return e.abuseEvents
}
