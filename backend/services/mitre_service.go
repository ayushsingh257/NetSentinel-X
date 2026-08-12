package services

import (
	"fmt"
	"strings"
	"sync"

	"netsentinel-x-backend/models"
)

type MITREService struct {
	mu         sync.RWMutex
	techniques map[string]models.MITRETechnique
	tactics    []string
}

func NewMITREService() *MITREService {
	s := &MITREService{
		techniques: make(map[string]models.MITRETechnique),
		tactics: []string{
			"Initial Access",
			"Execution",
			"Persistence",
			"Privilege Escalation",
			"Defense Evasion",
			"Credential Access",
			"Discovery",
			"Lateral Movement",
			"Collection",
			"Command & Control",
			"Exfiltration",
			"Impact",
		},
	}
	s.seedKnowledgeBase()
	return s
}

func (s *MITREService) seedKnowledgeBase() {
	techs := []models.MITRETechnique{
		{
			ID:                    "T1190",
			Name:                  "Exploit Public-Facing Application",
			Tactic:                "Initial Access",
			Description:           "Adversaries may attempt to exploit a weakness in an Internet-facing application or web server to gain initial access.",
			DetectionCount:        18,
			RiskLevel:             "HIGH",
			ConfidenceScore:       0.92,
			AffectedHosts:         []string{"192.168.1.100 (Web-Server-01)"},
			CurrentAlerts:         []string{"ALT-1002: HTTP SQLi Attempt", "ALT-1005: RCE Exploit Payload"},
			RelatedInvestigations: []string{"INV-2026-003"},
			AIExplanation:         "Exploitation of web vulnerabilities allows remote code execution or initial network intrusion.",
			MitigationGuidance:    "Apply web application firewall (WAF) rules, patch public services, and enforce strict input validation.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1190/"},
		},
		{
			ID:                    "T1059",
			Name:                  "Command and Scripting Interpreter",
			Tactic:                "Execution",
			Description:           "Adversaries may abuse command and script interpreters (e.g. PowerShell, Bash, CMD) to execute commands.",
			DetectionCount:        34,
			RiskLevel:             "HIGH",
			ConfidenceScore:       0.95,
			AffectedHosts:         []string{"192.168.1.105 (Workstation-A)"},
			CurrentAlerts:         []string{"ALT-2040: Encoded PowerShell Command"},
			RelatedInvestigations: []string{"INV-2026-001"},
			AIExplanation:         "Scripting interpreters allow fileless execution of malicious payloads in memory.",
			MitigationGuidance:    "Constrain PowerShell language modes, enable Script Block Logging, and restrict execution policies.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1059/"},
		},
		{
			ID:                    "T1547",
			Name:                  "Boot or Logon Autostart Execution",
			Tactic:                "Persistence",
			Description:           "Adversaries may configure system settings to automatically execute a program upon system boot or user logon.",
			DetectionCount:        8,
			RiskLevel:             "MEDIUM",
			ConfidenceScore:       0.88,
			AffectedHosts:         []string{"192.168.1.105 (Workstation-A)"},
			CurrentAlerts:         []string{"ALT-3011: Registry Run Key Added"},
			RelatedInvestigations: []string{"INV-2026-001"},
			AIExplanation:         "Autostart execution ensures persistence across system reboots.",
			MitigationGuidance:    "Monitor registry run keys, startup folders, and systemd service creation events.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1547/"},
		},
		{
			ID:                    "T1068",
			Name:                  "Exploitation for Privilege Escalation",
			Tactic:                "Privilege Escalation",
			Description:           "Adversaries may exploit software vulnerabilities in an effort to elevate privileges on target host.",
			DetectionCount:        5,
			RiskLevel:             "HIGH",
			ConfidenceScore:       0.91,
			AffectedHosts:         []string{"192.168.1.180 (DB-Master)"},
			CurrentAlerts:         []string{"ALT-4002: Kernel Exploit Signature"},
			RelatedInvestigations: []string{"INV-2026-002"},
			AIExplanation:         "Local privilege escalation converts standard user access into SYSTEM or root privileges.",
			MitigationGuidance:    "Deploy kernel security patches promptly and restrict local administrator permissions.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1068/"},
		},
		{
			ID:                    "T1070",
			Name:                  "Indicator Removal",
			Tactic:                "Defense Evasion",
			Description:           "Adversaries may delete or modify artifacts generated on a system to impede detection and forensic analysis.",
			DetectionCount:        12,
			RiskLevel:             "MEDIUM",
			ConfidenceScore:       0.89,
			AffectedHosts:         []string{"192.168.1.105 (Workstation-A)"},
			CurrentAlerts:         []string{"ALT-5012: Audit Log Cleared"},
			RelatedInvestigations: []string{"INV-2026-001"},
			AIExplanation:         "Log deletion conceals malicious actions and delays SOC incident investigation.",
			MitigationGuidance:    "Forward security logs in real-time to a remote immutable SIEM or central syslog server.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1070/"},
		},
		{
			ID:                    "T1110",
			Name:                  "Brute Force",
			Tactic:                "Credential Access",
			Description:           "Adversaries may use brute force techniques to attempt access to accounts when credentials are not known.",
			DetectionCount:        45,
			RiskLevel:             "HIGH",
			ConfidenceScore:       0.98,
			AffectedHosts:         []string{"192.168.1.180 (SSH-Server)", "10.0.0.1 (Gateway)"},
			CurrentAlerts:         []string{"ALT-2041: SSH Port Brute Force", "ALT-2042: High Failed Login Rate"},
			RelatedInvestigations: []string{"INV-2026-002"},
			AIExplanation:         "High-velocity login attempts target default or weak user account passwords.",
			MitigationGuidance:    "Enforce multi-factor authentication (MFA), account lockout thresholds, and Fail2ban rate limits.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1110/"},
		},
		{
			ID:                    "T1018",
			Name:                  "Remote System Discovery",
			Tactic:                "Discovery",
			Description:           "Adversaries may attempt to get a listing of other systems by IP address, hostname, or domain.",
			DetectionCount:        22,
			RiskLevel:             "LOW",
			ConfidenceScore:       0.85,
			AffectedHosts:         []string{"192.168.1.105 (Workstation-A)"},
			CurrentAlerts:         []string{"ALT-1088: NetBIOS Sweep Detected"},
			RelatedInvestigations: []string{"INV-2026-001"},
			AIExplanation:         "Internal host discovery maps active subnet IP addresses for lateral movement targets.",
			MitigationGuidance:    "Segment internal subnet VLANs and monitor internal port scanning traffic.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1018/"},
		},
		{
			ID:                    "T1021",
			Name:                  "Remote Services",
			Tactic:                "Lateral Movement",
			Description:           "Adversaries may use valid credentials to log into a service that accepts remote connections (e.g. SSH, RDP, SMB).",
			DetectionCount:        14,
			RiskLevel:             "HIGH",
			ConfidenceScore:       0.93,
			AffectedHosts:         []string{"192.168.1.105", "192.168.1.180"},
			CurrentAlerts:         []string{"ALT-6001: Lateral SMB Connection"},
			RelatedInvestigations: []string{"INV-2026-002"},
			AIExplanation:         "Adversaries traverse internal network segments using legitimate administrative protocols.",
			MitigationGuidance:    "Disable unused remote services, enforce host-based firewalls, and restrict administrative RDP/SSH access.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1021/"},
		},
		{
			ID:                    "T1005",
			Name:                  "Data from Local System",
			Tactic:                "Collection",
			Description:           "Adversaries may search local system sources, such as file systems and database storage, to find target data.",
			DetectionCount:        9,
			RiskLevel:             "MEDIUM",
			ConfidenceScore:       0.87,
			AffectedHosts:         []string{"192.168.1.180 (DB-Master)"},
			CurrentAlerts:         []string{"ALT-7002: Bulk File Access Burst"},
			RelatedInvestigations: []string{"INV-2026-003"},
			AIExplanation:         "Staging sensitive database records prior to exfiltration.",
			MitigationGuidance:    "Enforce strict file permissions, database access control lists (ACLs), and DLP monitoring.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1005/"},
		},
		{
			ID:                    "T1071",
			Name:                  "Application Layer Protocol",
			Tactic:                "Command & Control",
			Description:           "Adversaries may communicate using application layer protocols (HTTP, HTTPS, DNS) to blend in with normal network traffic.",
			DetectionCount:        68,
			RiskLevel:             "HIGH",
			ConfidenceScore:       0.97,
			AffectedHosts:         []string{"192.168.1.105 (Workstation-A)"},
			CurrentAlerts:         []string{"ALT-8001: Suspicious HTTP Beacon", "ALT-8005: TLS Certificate Anomaly"},
			RelatedInvestigations: []string{"INV-2026-001"},
			AIExplanation:         "Encrypted HTTP/TLS channels obscure malicious command and control beaconing.",
			MitigationGuidance:    "Implement SSL/TLS inspection on perimeter proxies and block unregistered C2 domains.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1071/"},
		},
		{
			ID:                    "T1048.003",
			Name:                  "Exfiltration Over Alternative Protocol (DNS)",
			Tactic:                "Exfiltration",
			Description:           "Adversaries may steal data by encoding payload fragments within DNS query subdomains.",
			DetectionCount:        29,
			RiskLevel:             "CRITICAL",
			ConfidenceScore:       0.99,
			AffectedHosts:         []string{"192.168.1.105 (Workstation-A)", "10.0.0.1 (Gateway)"},
			CurrentAlerts:         []string{"ALT-8910: High Entropy DNS Query Burst"},
			RelatedInvestigations: []string{"INV-2026-001"},
			AIExplanation:         "Data exfiltration using base64-encoded subdomains over UDP port 53 bypassing perimeter firewalls.",
			MitigationGuidance:    "Enforce DNS sinkholing, restrict outbound DNS requests to internal resolvers, and inspect DNS TXT record entropy.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1048/003/"},
		},
		{
			ID:                    "T1486",
			Name:                  "Data Encrypted for Impact",
			Tactic:                "Impact",
			Description:           "Adversaries may encrypt data on target systems to interrupt availability of system resources (Ransomware).",
			DetectionCount:        2,
			RiskLevel:             "CRITICAL",
			ConfidenceScore:       0.94,
			AffectedHosts:         []string{"192.168.1.180 (DB-Master)"},
			CurrentAlerts:         []string{"ALT-9001: Mass File Modification"},
			RelatedInvestigations: []string{"INV-2026-004"},
			AIExplanation:         "Destructive ransomware activity attempting volume shadow copy deletion and file encryption.",
			MitigationGuidance:    "Maintain offline immutable backups, deploy EDR anti-ransomware protection, and restrict volume shadow copy access.",
			ReferenceLinks:        []string{"https://attack.mitre.org/techniques/T1486/"},
		},
	}

	for _, t := range techs {
		s.techniques[t.ID] = t
	}
}

func (s *MITREService) GetMatrix() []models.MITRETacticGroup {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.MITRETacticGroup
	for _, tactic := range s.tactics {
		var list []models.MITRETechnique
		for _, tech := range s.techniques {
			if strings.EqualFold(tech.Tactic, tactic) {
				list = append(list, tech)
			}
		}
		result = append(result, models.MITRETacticGroup{
			TacticName: tactic,
			Techniques: list,
		})
	}
	return result
}

func (s *MITREService) GetTechniqueByID(id string) (models.MITRETechnique, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tech, exists := s.techniques[strings.ToUpper(id)]
	if !exists {
		// Case insensitive search fallback
		for _, t := range s.techniques {
			if strings.EqualFold(t.ID, id) {
				return t, true
			}
		}
	}
	return tech, exists
}

func (s *MITREService) SearchTechniques(query string) []models.MITRETechnique {
	s.mu.RLock()
	defer s.mu.RUnlock()

	q := strings.ToLower(query)
	var result []models.MITRETechnique

	for _, tech := range s.techniques {
		if strings.Contains(strings.ToLower(tech.ID), q) ||
			strings.Contains(strings.ToLower(tech.Name), q) ||
			strings.Contains(strings.ToLower(tech.Tactic), q) ||
			strings.Contains(strings.ToLower(tech.Description), q) {
			result = append(result, tech)
		}
	}
	return result
}

func (s *MITREService) GetStatistics() models.MITREStatistics {
	s.mu.RLock()
	defer s.mu.RUnlock()

	highRiskCount := 0
	for _, tech := range s.techniques {
		if tech.RiskLevel == "HIGH" || tech.RiskLevel == "CRITICAL" {
			highRiskCount++
		}
	}

	return models.MITREStatistics{
		TotalTechniquesMapped: len(s.techniques),
		ActiveTacticsCount:    len(s.tactics),
		HighRiskTechniques:    highRiskCount,
		TopAttackedHost:       "192.168.1.105 (Workstation-A)",
		OverallPostureScore:   86.4,
		Tactics:               s.tactics,
	}
}

func (s *MITREService) GetHeatMap() models.MITREHeatMap {
	s.mu.RLock()
	defer s.mu.RUnlock()

	freq := make(map[string]int)
	for id, tech := range s.techniques {
		freq[id] = tech.DetectionCount
	}

	return models.MITREHeatMap{
		MostTriggeredTechniques: []string{"T1071 (68)", "T1110 (45)", "T1059 (34)", "T1048.003 (29)"},
		MostActiveTactics:       []string{"Command & Control", "Credential Access", "Exfiltration", "Discovery"},
		MostAttackedHosts:       []string{"192.168.1.105", "192.168.1.180", "10.0.0.1"},
		TechniqueFrequency:      freq,
		SeverityDistribution: map[string]int{
			"CRITICAL": 2,
			"HIGH":     6,
			"MEDIUM":   3,
			"LOW":      1,
		},
		TacticsCoverage: s.tactics,
	}
}

func (s *MITREService) ExplainTechnique(id string) (string, string, bool) {
	tech, exists := s.GetTechniqueByID(id)
	if !exists {
		return fmt.Sprintf("Technique ID %s not found in MITRE ATT&CK knowledge base.", id), "Review standard MITRE enterprise matrix documentation.", false
	}

	explanation := fmt.Sprintf("MITRE ATT&CK %s (%s) under %s tactic: %s. AI Confidence Score: %.0f%%.",
		tech.ID, tech.Name, tech.Tactic, tech.AIExplanation, tech.ConfidenceScore*100)

	return explanation, tech.MitigationGuidance, true
}

func (s *MITREService) GetThreatMITREMapping(threatID string) map[string]interface{} {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tech, exists := s.techniques["T1190"]
	if !exists {
		for _, t := range s.techniques {
			tech = t
			break
		}
	}

	return map[string]interface{}{
		"threat_id":              threatID,
		"tactic":                 tech.Tactic,
		"technique_id":           tech.ID,
		"technique_name":         tech.Name,
		"description":            tech.Description,
		"confidence_score":       tech.ConfidenceScore,
		"recommended_mitigation": tech.MitigationGuidance,
		"reference":              tech.ReferenceLinks,
	}
}
