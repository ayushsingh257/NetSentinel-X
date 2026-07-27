package services

import (
	"sync"
	"time"
)

type DemoScenario struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Category    string   `json:"category"`
	Severity    string   `json:"severity"`
	Description string   `json:"description"`
	AttackFlow  []string `json:"attack_flow"`
	TargetHost  string   `json:"target_host"`
	AttackerIP  string   `json:"attacker_ip"`
}

type DemoLoadResult struct {
	ScenarioID   string    `json:"scenario_id"`
	ScenarioName string    `json:"scenario_name"`
	Status       string    `json:"status"`
	AlertsCount  int       `json:"alerts_count"`
	IncidentID   string    `json:"incident_id"`
	LoadedAt     time.Time `json:"loaded_at"`
}

type DemoScenarioService struct {
	mu        sync.RWMutex
	scenarios []DemoScenario
}

func NewDemoScenarioService() *DemoScenarioService {
	s := &DemoScenarioService{
		scenarios: []DemoScenario{
			{
				ID:          "SCENARIO-C2-BEACON",
				Name:        "Command & Control (C2) Beaconing Attack",
				Category:    "C2_COMMUNICATION",
				Severity:    "CRITICAL",
				Description: "Simulates compromised internal workstation establishing periodic encrypted DNS/TLS beaconing to an external Cobalt Strike listener.",
				AttackFlow: []string{
					"External Malicious IP (185.220.101.5)",
					"Periodic DNS Tunneling Requests to c2.malicious-domain.xyz",
					"Internal Host (192.168.1.105)",
					"Triggered Detection Rule: SIGMA-C2-BEACON-001",
					"MITRE ATT&CK Mapping: T1071.004 (DNS Tunneling) & T1573 (Encrypted Channel)",
					"Auto-Created Incident: INC-8821",
					"Executed SOAR Playbook: WORKFLOW-ISOLATE-HOST-01",
					"Executive Summary Report Generated",
				},
				TargetHost: "192.168.1.105",
				AttackerIP: "185.220.101.5",
			},
			{
				ID:          "SCENARIO-CREDENTIAL-BRUTEFORCE",
				Name:        "SSH & Kerberos Credential Stuffing Campaign",
				Category:    "CREDENTIAL_ACCESS",
				Severity:    "HIGH",
				Description: "Simulates automated distributed password spraying and SSH brute forcing against internal Active Directory domain controller.",
				AttackFlow: []string{
					"Distributed Botnet IPs (45.33.32.156, 198.51.100.42)",
					"1,200 Failed Login Attempts in 3 Minutes",
					"UEBA Detection: Anomaly Score 94/100 (Brute Force Anomaly)",
					"Threat Intel Fusion match: AbuseIPDB Confidence Score 98%",
					"Auto-Created Incident: INC-8822",
					"SOC Analyst Investigation Triggered",
				},
				TargetHost: "192.168.1.10",
				AttackerIP: "45.33.32.156",
			},
			{
				ID:          "SCENARIO-DATA-EXFILTRATION",
				Name:        "Encrypted HTTPS Bulk Data Exfiltration",
				Category:    "EXFILTRATION",
				Severity:    "CRITICAL",
				Description: "Simulates insider threat or compromised database server transferring 4.2 GB of confidential customer PII over port 443 to unauthorized cloud storage.",
				AttackFlow: []string{
					"Internal Database Server (192.168.1.50)",
					"Outbound Transfer Spike: 4.2 GB in 10 Minutes",
					"Behaviour Anomaly: UEBA Outbound Volume Deviation (+850%)",
					"Sigma Detection Rule: SIGMA-EXFIL-LARGE-TRANSFER",
					"Threat Hunt Executed: 'Find all outbound connections > 1GB'",
					"SOAR Containment: Firewalled Target IP & Revoked Active Session",
				},
				TargetHost: "192.168.1.50",
				AttackerIP: "104.21.55.88",
			},
		},
	}
	return s
}

func (s *DemoScenarioService) GetScenarios() []DemoScenario {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.scenarios
}

func (s *DemoScenarioService) LoadScenario(scenarioID string) (*DemoLoadResult, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var matched *DemoScenario
	for _, sc := range s.scenarios {
		if sc.ID == scenarioID {
			matched = &sc
			break
		}
	}

	if matched == nil {
		return nil, false
	}

	result := &DemoLoadResult{
		ScenarioID:   matched.ID,
		ScenarioName: matched.Name,
		Status:       "SUCCESSFULLY_LOADED",
		AlertsCount:  5,
		IncidentID:   "INC-8899",
		LoadedAt:     time.Now(),
	}

	return result, true
}
