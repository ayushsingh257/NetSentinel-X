package models

import "time"

// RefreshToken represents a single-use refresh token record.
type RefreshToken struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	TokenHash string    `json:"token_hash"`
	SessionID string    `json:"session_id"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
	Used      bool      `json:"used"`
	Revoked   bool      `json:"revoked"`
	ReusedAt  time.Time `json:"reused_at,omitempty"`
}

// UserSessionState defines session operational statuses.
type UserSessionState string

const (
	SessionActive     UserSessionState = "ACTIVE"
	SessionExpired    UserSessionState = "EXPIRED"
	SessionRevoked    UserSessionState = "REVOKED"
	SessionSuspicious UserSessionState = "SUSPICIOUS"
)

// UserSession represents an active user login session.
type UserSession struct {
	SessionID    string           `json:"session_id"`
	UserID       string           `json:"user_id"`
	Username     string           `json:"username"`
	Role         string           `json:"role"`
	Device       string           `json:"device"`
	Browser      string           `json:"browser"`
	IPAddress    string           `json:"ip_address"`
	Location     string           `json:"location"`
	CreatedAt    time.Time        `json:"created_at"`
	LastActivity time.Time        `json:"last_activity"`
	RiskScore    int              `json:"risk_score"`
	Status       UserSessionState `json:"status"`
}

// MFARecord contains TOTP multi-factor authentication configuration.
type MFARecord struct {
	UserID           string    `json:"user_id"`
	MFAEnabled       bool      `json:"mfa_enabled"`
	Secret           string    `json:"secret,omitempty"`
	RecoveryCodes    []string  `json:"recovery_codes,omitempty"` // Hashed
	LastVerification time.Time `json:"last_verification"`
}

// AuthEvent represents an identity security audit log event.
type AuthEvent struct {
	ID        string    `json:"id"`
	EventType string    `json:"event_type"` // LOGIN_SUCCESS, LOGIN_FAILURE, MFA_SUCCESS, MFA_FAILURE, TOKEN_REFRESH, SESSION_REVOKED, SUSPICIOUS_LOGIN
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	IP        string    `json:"ip"`
	Device    string    `json:"device"`
	Location  string    `json:"location"`
	RiskScore int       `json:"risk_score"`
	Timestamp time.Time `json:"timestamp"`
	Details   string    `json:"details"`
}
