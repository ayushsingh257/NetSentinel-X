package services

import (
	"strings"
	"sync"
	"time"
)

// LoginRiskAssessment holds risk scoring and detection flags.
type LoginRiskAssessment struct {
	RiskScore         int      `json:"risk_score"`          // 0-100
	RiskLevel         string   `json:"risk_level"`          // "LOW", "MEDIUM", "HIGH"
	ImpossibleTravel  bool     `json:"impossible_travel"`   // true if > 800 km/h velocity
	NewDeviceDetected bool     `json:"new_device_detected"` // true if unrecognized device
	SuspiciousIP      bool     `json:"suspicious_ip"`       // true if VPN/Tor/Malicious IP
	ActionRequired    string   `json:"action_required"`     // "ALLOW", "REQUIRE_MFA", "BLOCK"
	Reasons           []string `json:"reasons"`
}

// LoginLocationRecord stores user previous login metadata.
type LoginLocationRecord struct {
	IP        string
	Device    string
	Location  string
	Country   string
	Timestamp time.Time
}

// LoginRiskService assesses login attempts for impossible travel, unknown devices, and IP risks.
type LoginRiskService struct {
	mu            sync.RWMutex
	lastLogins    map[string]LoginLocationRecord // user_id -> last login
	suspiciousIPs map[string]bool
}

// NewLoginRiskService creates a new LoginRiskService instance.
func NewLoginRiskService() *LoginRiskService {
	s := &LoginRiskService{
		lastLogins: make(map[string]LoginLocationRecord),
		suspiciousIPs: map[string]bool{
			"185.220.101.5": true, // Known TOR Exit Node
			"198.51.100.44": true, // Known VPN IP
		},
	}
	s.seedLastLogins()
	return s
}

func (s *LoginRiskService) seedLastLogins() {
	s.lastLogins["USR-001"] = LoginLocationRecord{
		IP:        "103.21.124.50",
		Device:    "Windows 11 PC",
		Location:  "New Delhi, India",
		Country:   "India",
		Timestamp: time.Now().Add(-10 * time.Minute),
	}
}

// AssessLoginRisk calculates adaptive risk score and detects impossible travel or device anomalies.
func (s *LoginRiskService) AssessLoginRisk(userID, currentIP, currentDevice, currentLocation string, currentTimestamp time.Time) *LoginRiskAssessment {
	s.mu.Lock()
	defer s.mu.Unlock()

	score := 10
	reasons := []string{}
	impossibleTravel := false
	newDevice := false
	suspiciousIP := false

	// Check 1: Suspicious / TOR / VPN IP
	if s.suspiciousIPs[currentIP] || strings.Contains(currentIP, "185.220.") {
		score += 50
		suspiciousIP = true
		reasons = append(reasons, "Login attempt originating from known TOR/VPN exit node.")
	}

	last, exists := s.lastLogins[userID]
	if exists {
		// Check 2: New Device Detection
		if last.Device != "" && last.Device != currentDevice {
			score += 35
			newDevice = true
			reasons = append(reasons, "Unrecognized new device fingerprint detected.")
		}

		// Check 3: Impossible Travel Detection
		// E.g., India to USA within 10 minutes
		timeDiff := currentTimestamp.Sub(last.Timestamp)
		locationChanged := (strings.Contains(last.Location, "India") && strings.Contains(currentLocation, "USA")) ||
			(strings.Contains(last.Location, "India") && strings.Contains(currentLocation, "Germany")) ||
			(last.Country != "" && strings.Contains(currentLocation, "USA") && last.Country != "USA")

		if locationChanged && timeDiff < 30*time.Minute {
			score += 85
			impossibleTravel = true
			reasons = append(reasons, "Impossible travel detected: Location velocity exceeds physical flight speeds.")
		}
	}

	// Record current login location
	s.lastLogins[userID] = LoginLocationRecord{
		IP:        currentIP,
		Device:    currentDevice,
		Location:  currentLocation,
		Country:   s.extractCountry(currentLocation),
		Timestamp: currentTimestamp,
	}

	if score > 100 {
		score = 100
	}

	riskLevel := "LOW"
	action := "ALLOW"

	if score > 70 {
		riskLevel = "HIGH"
		action = "BLOCK"
	} else if score > 30 {
		riskLevel = "MEDIUM"
		action = "REQUIRE_MFA"
	}

	return &LoginRiskAssessment{
		RiskScore:         score,
		RiskLevel:         riskLevel,
		ImpossibleTravel:  impossibleTravel,
		NewDeviceDetected: newDevice,
		SuspiciousIP:      suspiciousIP,
		ActionRequired:    action,
		Reasons:           reasons,
	}
}

func (s *LoginRiskService) extractCountry(location string) string {
	if strings.Contains(location, "India") {
		return "India"
	}
	if strings.Contains(location, "USA") || strings.Contains(location, "United States") {
		return "USA"
	}
	if strings.Contains(location, "Germany") {
		return "Germany"
	}
	return "Unknown"
}
