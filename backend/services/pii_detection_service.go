package services

import (
	"fmt"
	"regexp"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// PIIDetectionService scans input text and payloads for personally identifiable information (PII).
type PIIDetectionService struct {
	mu         sync.RWMutex
	findings   []models.PIIFinding
	emailRegex *regexp.Regexp
	phoneRegex *regexp.Regexp
	ipRegex    *regexp.Regexp
	ssnRegex   *regexp.Regexp
	tokenRegex *regexp.Regexp
}

// NewPIIDetectionService initializes PIIDetectionService with compiled security regex rules.
func NewPIIDetectionService() *PIIDetectionService {
	s := &PIIDetectionService{
		findings:   make([]models.PIIFinding, 0),
		emailRegex: regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`),
		phoneRegex: regexp.MustCompile(`\b\+?[1-9]\d{1,14}\b|\b\d{10}\b`),
		ipRegex:    regexp.MustCompile(`\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b`),
		ssnRegex:   regexp.MustCompile(`\b\d{3}-\d{2}-\d{4}\b`),
		tokenRegex: regexp.MustCompile(`eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+`),
	}
	s.seedFindings()
	return s
}

func (s *PIIDetectionService) seedFindings() {
	now := time.Now()
	s.findings = append(s.findings,
		models.PIIFinding{
			ID:          "PII-2026-001",
			Type:        "EMAIL",
			Value:       "analyst@netsentinel.internal",
			Location:    "audit_logs.payload",
			Severity:    "MEDIUM",
			Status:      "PII_FOUND",
			DetectedAt:  now.Add(-2 * time.Hour),
			MaskedValue: "a*****@netsentinel.internal",
		},
		models.PIIFinding{
			ID:          "PII-2026-002",
			Type:        "PHONE",
			Value:       "9876543210",
			Location:    "users.contact_number",
			Severity:    "HIGH",
			Status:      "PII_FOUND",
			DetectedAt:  now.Add(-1 * time.Hour),
			MaskedValue: "******3210",
		},
		models.PIIFinding{
			ID:          "PII-2026-003",
			Type:        "IP",
			Value:       "192.168.1.10",
			Location:    "auth_events.client_ip",
			Severity:    "LOW",
			Status:      "PII_FOUND",
			DetectedAt:  now.Add(-30 * time.Minute),
			MaskedValue: "192.168.xxx.xxx",
		},
	)
}

// DetectPII scans the input payload for PII vectors and returns PII_FOUND findings.
func (s *PIIDetectionService) DetectPII(input string, location string) ([]models.PIIFinding, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	newFindings := make([]models.PIIFinding, 0)
	now := time.Now()

	// 1. Email check
	emails := s.emailRegex.FindAllString(input, -1)
	for _, email := range emails {
		finding := models.PIIFinding{
			ID:         fmt.Sprintf("PII-%d-EML", now.UnixNano()),
			Type:       "EMAIL",
			Value:      email,
			Location:   location,
			Severity:   "MEDIUM",
			Status:     "PII_FOUND",
			DetectedAt: now,
		}
		newFindings = append(newFindings, finding)
		s.findings = append(s.findings, finding)
	}

	// 2. Phone check
	phones := s.phoneRegex.FindAllString(input, -1)
	for _, phone := range phones {
		if len(phone) >= 10 {
			finding := models.PIIFinding{
				ID:         fmt.Sprintf("PII-%d-PHN", now.UnixNano()),
				Type:       "PHONE",
				Value:      phone,
				Location:   location,
				Severity:   "HIGH",
				Status:     "PII_FOUND",
				DetectedAt: now,
			}
			newFindings = append(newFindings, finding)
			s.findings = append(s.findings, finding)
		}
	}

	// 3. IP check
	ips := s.ipRegex.FindAllString(input, -1)
	for _, ip := range ips {
		if ip != "127.0.0.1" && ip != "0.0.0.0" {
			finding := models.PIIFinding{
				ID:         fmt.Sprintf("PII-%d-IP", now.UnixNano()),
				Type:       "IP",
				Value:      ip,
				Location:   location,
				Severity:   "LOW",
				Status:     "PII_FOUND",
				DetectedAt: now,
			}
			newFindings = append(newFindings, finding)
			s.findings = append(s.findings, finding)
		}
	}

	// 4. SSN check
	ssns := s.ssnRegex.FindAllString(input, -1)
	for _, ssn := range ssns {
		finding := models.PIIFinding{
			ID:         fmt.Sprintf("PII-%d-SSN", now.UnixNano()),
			Type:       "NATIONAL_ID",
			Value:      ssn,
			Location:   location,
			Severity:   "CRITICAL",
			Status:     "PII_FOUND",
			DetectedAt: now,
		}
		newFindings = append(newFindings, finding)
		s.findings = append(s.findings, finding)
	}

	piiFound := len(newFindings) > 0
	return newFindings, piiFound
}

// GetFindings returns all registered PII findings.
func (s *PIIDetectionService) GetFindings() []models.PIIFinding {
	s.mu.RLock()
	defer s.mu.RUnlock()

	res := make([]models.PIIFinding, len(s.findings))
	copy(res, s.findings)
	return res
}
