package models

import "time"

type ActiveSession struct {
	SessionID  string    `json:"session_id"`
	UserID     string    `json:"user_id"`
	Username   string    `json:"username"`
	Role       Role      `json:"role"`
	IPAddress  string    `json:"ip_address"`
	UserAgent  string    `json:"user_agent"`
	DeviceInfo string    `json:"device_info"`
	LoginTime  time.Time `json:"login_time"`
	LastSeen   time.Time `json:"last_seen"`
	IsActive   bool      `json:"is_active"`
}

type SecurityEvent struct {
	ID          string    `json:"id"`
	EventType   string    `json:"event_type"` // "FAILED_LOGIN", "PRIVILEGE_CHANGE", "BLOCKED_REQUEST", "SUSPICIOUS_API"
	Severity    string    `json:"severity"`   // "LOW", "MEDIUM", "HIGH", "CRITICAL"
	Source      string    `json:"source"`
	Description string    `json:"description"`
	IPAddress   string    `json:"ip_address"`
	Timestamp   time.Time `json:"timestamp"`
}

type SecurityPosture struct {
	SecurityScore        int             `json:"security_score"`        // 0 - 100 e.g. 96
	AuthenticationStatus string          `json:"authentication_status"` // "HEALTHY"
	APIProtectionStatus  string          `json:"api_protection_status"` // "HEALTHY"
	SecretsStatus        string          `json:"secrets_status"`        // "HEALTHY"
	DependenciesStatus   string          `json:"dependencies_status"`   // "HEALTHY"
	ContainerStatus      string          `json:"container_status"`      // "WARNING"
	ActiveSessionsCount  int             `json:"active_sessions_count"`
	RecentSecurityEvents []SecurityEvent `json:"recent_security_events"`
	CheckedAt            time.Time       `json:"checked_at"`
}
