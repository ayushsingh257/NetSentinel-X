package services

import (
	"fmt"
	"regexp"
	"strings"
	"sync"
)

type ValidationResult struct {
	IsValid     bool   `json:"is_valid"`
	Blocked     bool   `json:"blocked"`
	AttackType  string `json:"attack_type,omitempty"`
	Reason      string `json:"reason,omitempty"`
	CleanedText string `json:"cleaned_text,omitempty"`
}

type InputValidationService struct {
	mu           sync.RWMutex
	xssPatterns  []*regexp.Regexp
	sqliPatterns []*regexp.Regexp
	cmdPatterns  []*regexp.Regexp
}

func NewInputValidationService() *InputValidationService {
	s := &InputValidationService{
		xssPatterns: []*regexp.Regexp{
			regexp.MustCompile(`(?i)<script[^>]*>`),
			regexp.MustCompile(`(?i)</script>`),
			regexp.MustCompile(`(?i)javascript:`),
			regexp.MustCompile(`(?i)vbscript:`),
			regexp.MustCompile(`(?i)onload\s*=`),
			regexp.MustCompile(`(?i)onerror\s*=`),
			regexp.MustCompile(`(?i)onclick\s*=`),
			regexp.MustCompile(`(?i)onmouseover\s*=`),
			regexp.MustCompile(`(?i)<iframe[^>]*>`),
			regexp.MustCompile(`(?i)<object[^>]*>`),
			regexp.MustCompile(`(?i)<embed[^>]*>`),
		},
		sqliPatterns: []*regexp.Regexp{
			regexp.MustCompile(`(?i)\bDROP\s+TABLE\b`),
			regexp.MustCompile(`(?i)\bUNION\s+SELECT\b`),
			regexp.MustCompile(`(?i)\bSELECT\s+.*\s+FROM\b`),
			regexp.MustCompile(`(?i)\bDELETE\s+FROM\b`),
			regexp.MustCompile(`(?i)\bINSERT\s+INTO\b`),
			regexp.MustCompile(`(?i)'\s*OR\s*'\s*1\s*'\s*=\s*'\s*1`),
			regexp.MustCompile(`(?i)'\s*OR\s*1\s*=\s*1`),
			regexp.MustCompile(`(?i)"\s*OR\s*"\s*1\s*"\s*=\s*"\s*1`),
			regexp.MustCompile(`(?i);--`),
			regexp.MustCompile(`(?i)/\*.*\*/`),
		},
		cmdPatterns: []*regexp.Regexp{
			regexp.MustCompile(`(?i);\s*(rm|cat|ls|chmod|chown|wget|curl|nc|bash|sh|powershell)\b`),
			regexp.MustCompile(`(?i)\|\s*(rm|cat|ls|chmod|chown|wget|curl|nc|bash|sh|powershell)\b`),
			regexp.MustCompile(`(?i)` + "`" + `.*` + "`"),
		},
	}
	return s
}

// ValidateInput inspects a text string for malicious XSS, SQLi, or command injection patterns.
func (s *InputValidationService) ValidateInput(input string) ValidationResult {
	s.mu.RLock()
	defer s.mu.RUnlock()

	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return ValidationResult{IsValid: true, Blocked: false, CleanedText: ""}
	}

	// XSS Check
	for _, pattern := range s.xssPatterns {
		if pattern.MatchString(trimmed) {
			return ValidationResult{
				IsValid:    false,
				Blocked:    true,
				AttackType: "XSS",
				Reason:     fmt.Sprintf("Input contains forbidden XSS pattern matching '%s'", pattern.String()),
			}
		}
	}

	// SQL Injection Check
	for _, pattern := range s.sqliPatterns {
		if pattern.MatchString(trimmed) {
			return ValidationResult{
				IsValid:    false,
				Blocked:    true,
				AttackType: "SQLI",
				Reason:     fmt.Sprintf("Input contains forbidden SQL injection pattern matching '%s'", pattern.String()),
			}
		}
	}

	// Command Injection Check
	for _, pattern := range s.cmdPatterns {
		if pattern.MatchString(trimmed) {
			return ValidationResult{
				IsValid:    false,
				Blocked:    true,
				AttackType: "COMMAND_INJECTION",
				Reason:     "Input contains forbidden OS command injection character/sequence",
			}
		}
	}

	return ValidationResult{
		IsValid:     true,
		Blocked:     false,
		CleanedText: trimmed,
	}
}

// SanitizeHTML strips hazardous HTML tags and event attributes while retaining safe text.
func (s *InputValidationService) SanitizeHTML(input string) string {
	cleaned := input
	for _, p := range s.xssPatterns {
		cleaned = p.ReplaceAllString(cleaned, "")
	}
	return strings.TrimSpace(cleaned)
}
