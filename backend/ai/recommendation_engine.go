package ai

import (
	"fmt"
	"strings"
)

type RecommendationEngine struct{}

func NewRecommendationEngine() *RecommendationEngine {
	return &RecommendationEngine{}
}

func (re *RecommendationEngine) GeneratePlaybook(category, severity string) []string {
	cat := strings.ToLower(category)
	sev := strings.ToLower(severity)

	base := []string{
		fmt.Sprintf("Audit event source logs for category: %s", category),
		"Verify integrity of endpoint process memory.",
	}

	if cat == "malware" || sev == "critical" {
		base = append(base,
			"Initiate host isolation via EDR agent.",
			"Quarantine suspect binaries and extract SHA-256 hashes.",
			"Submit file hashes to VirusTotal & internal sandbox.",
		)
	} else if cat == "credential abuse" || cat == "phishing" {
		base = append(base,
			"Force password reset and invalidate active SSO tokens.",
			"Enforce hardware FIDO2 MFA on affected accounts.",
			"Audit OAuth application consent grants.",
		)
	} else if cat == "network attack" {
		base = append(base,
			"Apply dynamic BGP blackholing / firewall rate limiting.",
			"Inspect TCP SYN flood and ICMP rate counters.",
		)
	}

	return base
}
