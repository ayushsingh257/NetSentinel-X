package models

import "time"

// EventSeverity represents SIEM security event severity levels.
type EventSeverity string

const (
	SeverityInfo     EventSeverity = "INFO"
	SeverityLow      EventSeverity = "LOW"
	SeverityMedium   EventSeverity = "MEDIUM"
	SeverityHigh     EventSeverity = "HIGH"
	SeverityCritical EventSeverity = "CRITICAL"
)

// SecurityAuditLog represents an immutable, hash-chained security audit log entry.
type SecurityAuditLog struct {
	ID           string        `json:"id"`
	EventType    string        `json:"event_type"`
	Severity     EventSeverity `json:"severity"`
	UserID       string        `json:"user_id"`
	Username     string        `json:"username"`
	Role         string        `json:"role"`
	IPAddress    string        `json:"ip_address"`
	Device       string        `json:"device"`
	Location     string        `json:"location"`
	Action       string        `json:"action"`
	Resource     string        `json:"resource"`
	Timestamp    time.Time     `json:"timestamp"`
	PreviousHash string        `json:"previous_hash"`
	CurrentHash  string        `json:"current_hash"`
}

// AlertStatus defines the state lifecycle of a SIEM threat alert.
type AlertStatus string

const (
	AlertOpen          AlertStatus = "OPEN"
	AlertInvestigating AlertStatus = "INVESTIGATING"
	AlertResolved      AlertStatus = "RESOLVED"
)

// SIEMAlert represents a correlated security threat alert.
type SIEMAlert struct {
	AlertID          string        `json:"alert_id"`
	Severity         EventSeverity `json:"severity"`
	Title            string        `json:"title"`
	Description      string        `json:"description"`
	AffectedUser     string        `json:"affected_user"`
	AffectedResource string        `json:"affected_resource"`
	Timestamp        time.Time     `json:"timestamp"`
	Status           AlertStatus   `json:"status"`
}

// IncidentTimelineEvent represents a step in an automatically reconstructed attack timeline.
type IncidentTimelineEvent struct {
	ID        string        `json:"id"`
	Timestamp time.Time     `json:"timestamp"`
	Category  string        `json:"category"`
	Summary   string        `json:"summary"`
	Severity  EventSeverity `json:"severity"`
	User      string        `json:"user"`
	IP        string        `json:"ip"`
}

// SIEMPosture summarizes overall security monitoring health.
type SIEMPosture struct {
	Score               int       `json:"score"`
	TotalEventsCount    int       `json:"total_events_count"`
	OpenAlertsCount     int       `json:"open_alerts_count"`
	CriticalAlertsCount int       `json:"critical_alerts_count"`
	HashChainValid      bool      `json:"hash_chain_valid"`
	LastVerification    time.Time `json:"last_verification"`
	Status              string    `json:"status"`
}
