package services

import (
	"regexp"
	"strings"
	"sync"
)

type XSSCheckResult struct {
	Detected    bool   `json:"detected"`
	PayloadType string `json:"payload_type,omitempty"`
	CleanedText string `json:"cleaned_text"`
}

type XSSProtectionService struct {
	mu             sync.RWMutex
	storedPatterns []*regexp.Regexp
	reflPatterns   []*regexp.Regexp
	domPatterns    []*regexp.Regexp
}

func NewXSSProtectionService() *XSSProtectionService {
	return &XSSProtectionService{
		storedPatterns: []*regexp.Regexp{
			regexp.MustCompile(`(?i)<script\b[^>]*>([\s\S]*?)<\/script>`),
			regexp.MustCompile(`(?i)<script[^>]*>`),
			regexp.MustCompile(`(?i)</script>`),
		},
		reflPatterns: []*regexp.Regexp{
			regexp.MustCompile(`(?i)<img[^>]+onerror\s*=\s*['"]?[^'"]+['"]?`),
			regexp.MustCompile(`(?i)<svg[^>]+onload\s*=\s*['"]?[^'"]+['"]?`),
			regexp.MustCompile(`(?i)<body[^>]+onload\s*=\s*['"]?[^'"]+['"]?`),
		},
		domPatterns: []*regexp.Regexp{
			regexp.MustCompile(`(?i)javascript\s*:\s*`),
			regexp.MustCompile(`(?i)vbscript\s*:\s*`),
			regexp.MustCompile(`(?i)data\s*:\s*text/html`),
		},
	}
}

// DetectXSS checks string for Stored, Reflected, or DOM XSS vectors.
func (x *XSSProtectionService) DetectXSS(input string) XSSCheckResult {
	x.mu.RLock()
	defer x.mu.RUnlock()

	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return XSSCheckResult{Detected: false, CleanedText: ""}
	}

	for _, p := range x.storedPatterns {
		if p.MatchString(trimmed) {
			return XSSCheckResult{
				Detected:    true,
				PayloadType: "STORED_XSS",
				CleanedText: x.SanitizeText(trimmed),
			}
		}
	}

	for _, p := range x.reflPatterns {
		if p.MatchString(trimmed) {
			return XSSCheckResult{
				Detected:    true,
				PayloadType: "REFLECTED_XSS",
				CleanedText: x.SanitizeText(trimmed),
			}
		}
	}

	for _, p := range x.domPatterns {
		if p.MatchString(trimmed) {
			return XSSCheckResult{
				Detected:    true,
				PayloadType: "DOM_INJECTION",
				CleanedText: x.SanitizeText(trimmed),
			}
		}
	}

	return XSSCheckResult{
		Detected:    false,
		CleanedText: trimmed,
	}
}

// SanitizeText strips scripts, handlers, and dangerous protocols from text.
func (x *XSSProtectionService) SanitizeText(input string) string {
	cleaned := input
	allPatterns := append(append(x.storedPatterns, x.reflPatterns...), x.domPatterns...)
	for _, p := range allPatterns {
		cleaned = p.ReplaceAllString(cleaned, "")
	}
	return strings.TrimSpace(cleaned)
}
