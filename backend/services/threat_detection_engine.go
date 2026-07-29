package services

import (
	"sync"

	"netsentinel-x-backend/models"
)

// ThreatDetectionEngine correlates normalized security logs to detect attacks.
type ThreatDetectionEngine struct {
	mu           sync.RWMutex
	auditChain   *AuditChainService
	alertService *SecurityAlertService
	failedLogins map[string]int // IP -> failed count
}

// NewThreatDetectionEngine creates a new ThreatDetectionEngine instance.
func NewThreatDetectionEngine(auditChain *AuditChainService, alertService *SecurityAlertService) *ThreatDetectionEngine {
	return &ThreatDetectionEngine{
		auditChain:   auditChain,
		alertService: alertService,
		failedLogins: make(map[string]int),
	}
}

// EvaluateBruteForce checks if an IP address has accumulated >= 10 failed logins in 5 minutes.
func (e *ThreatDetectionEngine) EvaluateBruteForce(ip, username string) *models.SIEMAlert {
	e.mu.Lock()
	defer e.mu.Unlock()

	e.failedLogins[ip]++
	if e.failedLogins[ip] >= 10 {
		alert := e.alertService.CreateAlert(
			models.SeverityHigh,
			"BRUTE_FORCE_ATTACK",
			"Brute Force Attack Detected: 10+ failed login attempts originating from IP "+ip,
			username,
			"Authentication Service",
		)
		e.failedLogins[ip] = 0 // reset after firing
		return alert
	}
	return nil
}

// EvaluatePrivilegeEscalation checks unauthorized admin endpoint attempts.
func (e *ThreatDetectionEngine) EvaluatePrivilegeEscalation(username, role, resource string) *models.SIEMAlert {
	if role != "SUPER_ADMIN" && role != "SOC_ADMIN" {
		return e.alertService.CreateAlert(
			models.SeverityCritical,
			"PRIVILEGE_ESCALATION",
			"Privilege Escalation Attempt: User "+username+" ("+role+") attempted unauthorized access to restricted resource "+resource,
			username,
			resource,
		)
	}
	return nil
}

// EvaluateDataExfiltration checks bulk export queries.
func (e *ThreatDetectionEngine) EvaluateDataExfiltration(username, query string, recordCount int) *models.SIEMAlert {
	if recordCount > 10000 {
		return e.alertService.CreateAlert(
			models.SeverityHigh,
			"DATA_EXFILTRATION",
			"Potential Data Exfiltration: Bulk query export of "+query+" returned "+string(rune(recordCount))+" records outside normal baseline.",
			username,
			"Database Engine",
		)
	}
	return nil
}
