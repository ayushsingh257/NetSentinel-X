package services

import (
	"regexp"
	"strings"
	"time"
)

// SecretLeakFinding represents a detected secret leak.
type SecretLeakFinding struct {
	ID          string    `json:"id"`
	SecretType  string    `json:"secret_type"`
	Pattern     string    `json:"pattern"`
	Severity    string    `json:"severity"` // LOW, MEDIUM, HIGH, CRITICAL
	Sample      string    `json:"sample"`   // Masked match sample
	Description string    `json:"description"`
	Remediation string    `json:"remediation"`
	DetectedAt  time.Time `json:"detected_at"`
}

// SecretLeakReport contains secret scanning findings.
type SecretLeakReport struct {
	TotalLeaks      int                 `json:"total_leaks"`
	CriticalLeaks   int                 `json:"critical_leaks"`
	HighLeaks       int                 `json:"high_leaks"`
	MediumLeaks     int                 `json:"medium_leaks"`
	LowLeaks        int                 `json:"low_leaks"`
	Findings        []SecretLeakFinding `json:"findings"`
	ScannedAt       time.Time           `json:"scanned_at"`
	CleanDeployment bool                `json:"clean_deployment"`
}

// SecretDetectionService scans strings and configs for hardcoded or leaked credentials.
type SecretDetectionService struct {
	patterns map[string]*regexp.Regexp
}

// NewSecretDetectionService creates a new SecretDetectionService with regex leak patterns.
func NewSecretDetectionService() *SecretDetectionService {
	return &SecretDetectionService{
		patterns: map[string]*regexp.Regexp{
			"AWS Access Key":       regexp.MustCompile(`AKIA[0-9A-Z]{16}`),
			"JWT Token":            regexp.MustCompile(`eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+`),
			"API Key Prefix":       regexp.MustCompile(`nsx_live_[a-f0-9]{16,}`),
			"Database Password":    regexp.MustCompile(`(?i)(DATABASE_PASSWORD|DB_PASS|POSTGRES_PASSWORD)\s*=\s*['"]?[a-zA-Z0-9_@#$%-]{4,}['"]?`),
			"JWT Secret Hardcoded": regexp.MustCompile(`(?i)(JWT_SECRET|SECRET_KEY)\s*=\s*['"]?[a-zA-Z0-9_@#$%-]{4,}['"]?`),
			"RSA Private Key":      regexp.MustCompile(`-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----`),
		},
	}
}

// ScanString scans any input string for leaked secrets.
func (s *SecretDetectionService) ScanString(input string) *SecretLeakReport {
	var findings []SecretLeakFinding
	var crit, high, med, low int

	lines := strings.Split(input, "\n")
	for idx, line := range lines {
		for pName, re := range s.patterns {
			if matches := re.FindAllString(line, -1); len(matches) > 0 {
				for _, match := range matches {
					sev := "HIGH"
					desc := "Potential secret leakage detected in payload/config."
					rem := "Rotate secret immediately and move to secret provider (Vault)."

					if strings.Contains(pName, "AWS") || strings.Contains(pName, "RSA") || strings.Contains(pName, "JWT Secret") {
						sev = "CRITICAL"
						crit++
					} else if strings.Contains(pName, "Database") || strings.Contains(pName, "API Key") {
						sev = "HIGH"
						high++
					} else if strings.Contains(pName, "JWT Token") {
						sev = "MEDIUM"
						med++
					} else {
						sev = "LOW"
						low++
					}

					masked := match
					if len(match) > 8 {
						masked = match[:4] + "...." + match[len(match)-4:]
					}

					findings = append(findings, SecretLeakFinding{
						ID:          pName,
						SecretType:  pName,
						Pattern:     re.String(),
						Severity:    sev,
						Sample:      masked,
						Description: desc + " Line " + string(rune(idx+1)),
						Remediation: rem,
						DetectedAt:  time.Now(),
					})
				}
			}
		}
	}

	return &SecretLeakReport{
		TotalLeaks:      len(findings),
		CriticalLeaks:   crit,
		HighLeaks:       high,
		MediumLeaks:     med,
		LowLeaks:        low,
		Findings:        findings,
		ScannedAt:       time.Now(),
		CleanDeployment: len(findings) == 0,
	}
}
