package services

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"time"
)

// DataMaskingService provides cryptographic data masking for emails, phones, IPs, and secrets.
type DataMaskingService struct{}

// NewDataMaskingService initializes DataMaskingService.
func NewDataMaskingService() *DataMaskingService {
	return &DataMaskingService{}
}

// MaskEmail masks email addresses (e.g. example@test.com -> e*****@test.com).
func (s *DataMaskingService) MaskEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return "[REDACTED_EMAIL]"
	}
	user := parts[0]
	domain := parts[1]

	if len(user) <= 1 {
		return "*@" + domain
	}

	maskedUser := string(user[0]) + strings.Repeat("*", 5)
	return maskedUser + "@" + domain
}

// MaskPhone masks phone numbers (e.g. 9876543210 -> ******3210).
func (s *DataMaskingService) MaskPhone(phone string) string {
	if len(phone) < 4 {
		return "******"
	}
	last4 := phone[len(phone)-4:]
	return strings.Repeat("*", len(phone)-4) + last4
}

// MaskIP masks IPv4 addresses (e.g. 192.168.1.10 -> 192.168.xxx.xxx).
func (s *DataMaskingService) MaskIP(ip string) string {
	parts := strings.Split(ip, ".")
	if len(parts) != 4 {
		return "xxx.xxx.xxx.xxx"
	}
	return parts[0] + "." + parts[1] + ".xxx.xxx"
}

// MaskSecret masks sensitive secrets or credentials with [REDACTED].
func (s *DataMaskingService) MaskSecret(secret string) string {
	return "[REDACTED]"
}

// MaskPayload performs automatic pattern masking over an input payload and computes SHA-256 hash of original value.
func (s *DataMaskingService) MaskPayload(raw string) (string, string, time.Time) {
	now := time.Now()
	hash := sha256.Sum256([]byte(raw))
	hashStr := hex.EncodeToString(hash[:])

	// Replace secrets
	masked := raw
	if strings.Contains(strings.ToLower(masked), "password") || strings.Contains(strings.ToLower(masked), "secret") {
		masked = "[REDACTED]"
	}

	return masked, hashStr, now
}
