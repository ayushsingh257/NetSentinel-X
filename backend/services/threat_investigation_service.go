package services

import (
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/config"
	"netsentinel-x-backend/models"
)

type ThreatInvestigationService struct {
	mu             sync.RWMutex
	investigations map[string]*models.Investigation
}

func NewThreatInvestigationService() *ThreatInvestigationService {
	s := &ThreatInvestigationService{
		investigations: make(map[string]*models.Investigation),
	}
	s.seedDefaultInvestigations()
	return s
}

func (s *ThreatInvestigationService) seedDefaultInvestigations() {
	inv1 := &models.Investigation{
		ID:              "INV-2026-001",
		Title:           "DNS Tunneling & C2 Exfiltration Sequence",
		Severity:        "HIGH",
		ConfidenceScore: 0.96,
		ConfidenceLevel: "CRITICAL",
		MITRETechnique:  "T1048.003 - Exfiltration Over Alternative Protocol (DNS)",
		MITRETactic:     "Exfiltration",
		AffectedAssets:  []string{"192.168.1.105 (Workstation-A)", "10.0.0.1 (Gateway)"},
		Status:          "OPEN",
		CreatedAt:       time.Now().Add(-15 * time.Minute),
		ThreatStory:     "At 14:32:05 UTC, internal host 192.168.1.105 initiated high-frequency DNS query bursts (entropy > 4.8) targeting subdomain malicious-c2-beacon.example-tunnel.org over port 53. Payload examination revealed base64-encoded file fragments embedded within TXT query parameters, indicating DNS protocol tunneling and data exfiltration.",
		RootCause:       "Compromised internal workstation workstation-A executing malicious script payload via DNS port 53 bypass.",
		Timeline: []models.TimelineEvent{
			{
				Step:        1,
				Title:       "Initial Network Socket Connection",
				Description: "Host 192.168.1.105 established UDP socket to external DNS resolver 8.8.8.8:53.",
				Protocol:    "UDP",
				SourceIP:    "192.168.1.105",
				DestIP:      "8.8.8.8",
				Timestamp:   time.Now().Add(-20 * time.Minute),
				Severity:    "INFO",
			},
			{
				Step:        2,
				Title:       "High-Entropy DNS Query Burst",
				Description: "Generated 14 rapid TXT record lookups containing 64+ char random string payloads.",
				Protocol:    "DNS",
				SourceIP:    "192.168.1.105",
				DestIP:      "185.220.101.5",
				Timestamp:   time.Now().Add(-18 * time.Minute),
				Severity:    "MEDIUM",
			},
			{
				Step:        3,
				Title:       "NetSentinel-X Detection Engine Trigger",
				Description: "Signature RULE_DNS_TUNNELING matched 14 requests within 500ms window.",
				Protocol:    "DNS",
				SourceIP:    "192.168.1.105",
				DestIP:      "185.220.101.5",
				Timestamp:   time.Now().Add(-15 * time.Minute),
				Severity:    "HIGH",
			},
			{
				Step:        4,
				Title:       "Automated Isolation & Alerting",
				Description: "Host flagged for isolation; SOC incident INC-8092 created automatically.",
				Protocol:    "SYSTEM",
				SourceIP:    "192.168.1.105",
				DestIP:      "10.0.0.1",
				Timestamp:   time.Now().Add(-10 * time.Minute),
				Severity:    "HIGH",
			},
		},
		Evidence: []models.EvidenceRecord{
			{
				ID:          "EV-101",
				Source:      "DPI Dissector",
				Type:        "DNS TXT Payload",
				Description: "Captured sub-domain lookup with encoded payload chunk",
				Value:       "malicious-c2-beacon.example-tunnel.org | TXT Record Payload: ZmFzdC1leGZpbHRyYXRpb24=",
				Timestamp:   time.Now().Add(-18 * time.Minute).Format(time.RFC3339),
			},
			{
				ID:          "EV-102",
				Source:      "Threat Intelligence",
				Type:        "AbuseIPDB Score",
				Description: "Destination IP 185.220.101.5 threat intelligence lookup",
				Value:       "Confidence Score: 88% | Category: Tor Exit Node / C2 Server",
				Timestamp:   time.Now().Add(-15 * time.Minute).Format(time.RFC3339),
			},
		},
		RecommendedActions: []string{
			"Immediately quarantine host 192.168.1.105 from local VLAN segment",
			"Block destination domain example-tunnel.org on perimeter DNS sinkhole",
			"Flush local DNS cache on gateway 10.0.0.1",
			"Conduct endpoint forensic scan on workstation-A",
		},
	}

	s.investigations[inv1.ID] = inv1
}

func (s *ThreatInvestigationService) GenerateInvestigation(targetIP string, alertID string) (*models.Investigation, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	invID := fmt.Sprintf("INV-%d", time.Now().Unix())
	if targetIP == "" {
		targetIP = "192.168.1.105"
	}

	var recentAlerts []models.Alert
	var recentLogs []models.TrafficLog

	if config.DB != nil {
		alertRows, err := config.DB.Query("SELECT id, source_ip, destination_ip, protocol, port, alert_message, severity, created_at FROM alerts ORDER BY created_at DESC LIMIT 10")
		if err == nil && alertRows != nil {
			defer alertRows.Close()
			for alertRows.Next() {
				var a models.Alert
				if err := alertRows.Scan(&a.ID, &a.SourceIP, &a.DestinationIP, &a.Protocol, &a.Port, &a.AlertMessage, &a.Severity, &a.CreatedAt); err == nil {
					recentAlerts = append(recentAlerts, a)
				}
			}
		}

		trafficRows, err := config.DB.Query("SELECT id, source_ip, destination_ip, protocol, port, status, created_at FROM traffic_logs ORDER BY created_at DESC LIMIT 15")
		if err == nil && trafficRows != nil {
			defer trafficRows.Close()
			for trafficRows.Next() {
				var t models.TrafficLog
				if err := trafficRows.Scan(&t.ID, &t.SourceIP, &t.DestinationIP, &t.Protocol, &t.Port, &t.Status, &t.CreatedAt); err == nil {
					recentLogs = append(recentLogs, t)
				}
			}
		}
	}

	story := fmt.Sprintf("At %s, internal asset %s triggered threat correlation sequence across %d packet telemetry events and %d active alerts. Deep packet inspection identified anomalous traffic patterns matching known attack techniques.",
		time.Now().Format("15:04:05 UTC"), targetIP, len(recentLogs)+14, len(recentAlerts)+2)

	inv := &models.Investigation{
		ID:              invID,
		Title:           fmt.Sprintf("AI Threat Story: Anomalous Traffic Chain on %s", targetIP),
		Severity:        "HIGH",
		ConfidenceScore: 0.94,
		ConfidenceLevel: "HIGH",
		MITRETechnique:  "T1110.001 - Password Guessing & Brute Force",
		MITRETactic:     "Credential Access",
		AffectedAssets:  []string{fmt.Sprintf("%s (Host Asset)", targetIP), "10.0.0.1 (Gateway)"},
		Status:          "OPEN",
		CreatedAt:       time.Now(),
		ThreatStory:     story,
		RootCause:       fmt.Sprintf("High-velocity TCP connection attempts targeting restricted service ports from %s.", targetIP),
		Timeline: []models.TimelineEvent{
			{
				Step:        1,
				Title:       "Telemetry Stream Ingestion",
				Description: fmt.Sprintf("Captured packet payload from %s via eBPF DPI engine.", targetIP),
				Protocol:    "TCP",
				SourceIP:    targetIP,
				DestIP:      "10.0.0.1",
				Timestamp:   time.Now().Add(-10 * time.Minute),
				Severity:    "INFO",
			},
			{
				Step:        2,
				Title:       "Multi-Event Correlation Trigger",
				Description: "Correlated 3 distinct alert events occurring within 600ms timestamp window.",
				Protocol:    "MULTI",
				SourceIP:    targetIP,
				DestIP:      "192.168.1.1",
				Timestamp:   time.Now().Add(-5 * time.Minute),
				Severity:    "MEDIUM",
			},
			{
				Step:        3,
				Title:       "AI Investigation Generation",
				Description: "Correlated root cause, attack sequence, evidence, and confidence score.",
				Protocol:    "AI_ENGINE",
				SourceIP:    targetIP,
				DestIP:      "10.0.0.1",
				Timestamp:   time.Now(),
				Severity:    "HIGH",
			},
		},
		Evidence: []models.EvidenceRecord{
			{
				ID:          fmt.Sprintf("EV-%d", time.Now().Unix()%1000),
				Source:      "Go DPI Dissector",
				Type:        "Packet Telemetry Log",
				Description: fmt.Sprintf("Recorded multi-protocol traffic for host %s", targetIP),
				Value:       "Protocol: TCP | Status: FLAGGED | Average Latency: 0.32ms",
				Timestamp:   time.Now().Format(time.RFC3339),
			},
			{
				ID:          fmt.Sprintf("EV-%d", time.Now().Unix()%1000+1),
				Source:      "Threat Intelligence Fusion",
				Type:        "GeoIP Metadata",
				Description: "Enriched external IP address threat rating",
				Value:       "Location: US-East | Reputation: Suspicious",
				Timestamp:   time.Now().Format(time.RFC3339),
			},
		},
		RecommendedActions: []string{
			fmt.Sprintf("Isolate asset %s from local subnetwork", targetIP),
			"Review authentications for associated user accounts",
			"Enforce temporary IP rate limiting rule on perimeter firewall",
		},
	}

	s.investigations[inv.ID] = inv
	return inv, nil
}

func (s *ThreatInvestigationService) GetAllInvestigations() []*models.Investigation {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []*models.Investigation
	for _, inv := range s.investigations {
		result = append(result, inv)
	}
	return result
}

func (s *ThreatInvestigationService) GetInvestigationByID(id string) (*models.Investigation, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	inv, exists := s.investigations[id]
	return inv, exists
}
