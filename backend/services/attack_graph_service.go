package services

import (
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type AttackGraphService struct {
	mu    sync.RWMutex
	nodes map[string]models.AttackNode
	edges map[string]models.AttackEdge
	paths map[string]models.AttackPath
}

func NewAttackGraphService() *AttackGraphService {
	s := &AttackGraphService{
		nodes: make(map[string]models.AttackNode),
		edges: make(map[string]models.AttackEdge),
		paths: make(map[string]models.AttackPath),
	}
	s.seedGraphData()
	return s
}

func (s *AttackGraphService) seedGraphData() {
	now := time.Now()

	n1 := models.AttackNode{
		ID:               "NODE-EXT-IP-01",
		Type:             "EXTERNAL_IP",
		Label:            "185.220.101.45 (Malicious C2 Host)",
		IP:               "185.220.101.45",
		ThreatScore:      96,
		RiskLevel:        "CRITICAL",
		RelatedIncidents: []string{"INC-2026-8001"},
	}

	n2 := models.AttackNode{
		ID:               "NODE-DOM-01",
		Type:             "DOMAIN",
		Label:            "c2-command.malicious.net",
		Domain:           "c2-command.malicious.net",
		ThreatScore:      92,
		RiskLevel:        "CRITICAL",
		RelatedIncidents: []string{"INC-2026-8001"},
	}

	n3 := models.AttackNode{
		ID:               "NODE-HOST-01",
		Type:             "INTERNAL_HOST",
		Label:            "192.168.1.105 (Workstation-A)",
		IP:               "192.168.1.105",
		Hostname:         "Workstation-A",
		Asset:            "Finance VLAN-10",
		ThreatScore:      90,
		RiskLevel:        "CRITICAL",
		MITRETechniques:  []string{"T1071.001"},
		RelatedIncidents: []string{"INC-2026-8001"},
	}

	n4 := models.AttackNode{
		ID:              "NODE-RULE-01",
		Type:            "DETECTION_RULE",
		Label:           "RULE-SIGMA-001 (DNS Tunneling)",
		ThreatScore:     85,
		RiskLevel:       "HIGH",
		MITRETechniques: []string{"T1071.001"},
	}

	n5 := models.AttackNode{
		ID:              "NODE-TECH-01",
		Type:            "MITRE_TECHNIQUE",
		Label:           "T1071.001 - Application Layer Protocol: Web Protocols",
		ThreatScore:     88,
		RiskLevel:       "HIGH",
		MITRETechniques: []string{"T1071.001"},
	}

	n6 := models.AttackNode{
		ID:               "NODE-INC-01",
		Type:             "INCIDENT",
		Label:            "INC-2026-8001 (C2 Beaconing Event)",
		ThreatScore:      98,
		RiskLevel:        "CRITICAL",
		RelatedIncidents: []string{"INC-2026-8001"},
	}

	// Edges
	e1 := models.AttackEdge{ID: "EDGE-01", Source: "NODE-EXT-IP-01", Target: "NODE-DOM-01", Relationship: "Connected To", Confidence: 0.98, Timestamp: now.Add(-45 * time.Minute)}
	e2 := models.AttackEdge{ID: "EDGE-02", Source: "NODE-DOM-01", Target: "NODE-HOST-01", Relationship: "Communicated With", Confidence: 0.95, Timestamp: now.Add(-40 * time.Minute)}
	e3 := models.AttackEdge{ID: "EDGE-03", Source: "NODE-HOST-01", Target: "NODE-RULE-01", Relationship: "Triggered", Confidence: 0.92, Timestamp: now.Add(-35 * time.Minute)}
	e4 := models.AttackEdge{ID: "EDGE-04", Source: "NODE-RULE-01", Target: "NODE-TECH-01", Relationship: "Mapped To", Confidence: 0.90, Timestamp: now.Add(-30 * time.Minute)}
	e5 := models.AttackEdge{ID: "EDGE-05", Source: "NODE-TECH-01", Target: "NODE-INC-01", Relationship: "Caused", Confidence: 0.99, Timestamp: now.Add(-25 * time.Minute)}

	path1 := models.AttackPath{
		ID:                     "PATH-2026-001",
		PathName:               "Critical C2 Beaconing & Tunneling Attack Chain",
		NodeIDs:                []string{"NODE-EXT-IP-01", "NODE-DOM-01", "NODE-HOST-01", "NODE-RULE-01", "NODE-TECH-01", "NODE-INC-01"},
		EdgeIDs:                []string{"EDGE-01", "EDGE-02", "EDGE-03", "EDGE-04", "EDGE-05"},
		Severity:               "CRITICAL",
		PathRiskScore:          96,
		AIExplanation:          "Attack originated from malicious IP 185.220.101.45 via c2-command.malicious.net targeting internal Host 192.168.1.105 (Workstation-A). Telemetry triggered Rule RULE-SIGMA-001 mapped to MITRE T1071.001, resulting in Incident INC-2026-8001.",
		RootCause:              "Compromised browser extension on Workstation-A initiating periodic outbound HTTPS C2 callbacks.",
		AttackerObjective:      "Establish persistent C2 channel for staging internal data exfiltration.",
		AffectedAssets:         []string{"192.168.1.105 (Workstation-A)", "Finance VLAN-10"},
		RecommendedContainment: "Isolate Workstation-A from local VLAN, block IP 185.220.101.45 on boundary firewall, and revoke active user tokens.",
	}

	s.nodes[n1.ID] = n1
	s.nodes[n2.ID] = n2
	s.nodes[n3.ID] = n3
	s.nodes[n4.ID] = n4
	s.nodes[n5.ID] = n5
	s.nodes[n6.ID] = n6

	s.edges[e1.ID] = e1
	s.edges[e2.ID] = e2
	s.edges[e3.ID] = e3
	s.edges[e4.ID] = e4
	s.edges[e5.ID] = e5

	s.paths[path1.ID] = path1
}

func (s *AttackGraphService) GetGraphPayload() models.AttackGraphPayload {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var nodeList []models.AttackNode
	for _, n := range s.nodes {
		nodeList = append(nodeList, n)
	}

	var edgeList []models.AttackEdge
	for _, e := range s.edges {
		edgeList = append(edgeList, e)
	}

	var pathList []models.AttackPath
	for _, p := range s.paths {
		pathList = append(pathList, p)
	}

	return models.AttackGraphPayload{
		Nodes:              nodeList,
		Edges:              edgeList,
		CriticalPaths:      pathList,
		TotalNodes:         len(s.nodes),
		TotalEdges:         len(s.edges),
		GlobalMaxRiskScore: 96,
	}
}

func (s *AttackGraphService) GetNodes() []models.AttackNode {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []models.AttackNode
	for _, n := range s.nodes {
		list = append(list, n)
	}
	return list
}

func (s *AttackGraphService) GetEdges() []models.AttackEdge {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []models.AttackEdge
	for _, e := range s.edges {
		list = append(list, e)
	}
	return list
}

func (s *AttackGraphService) GetPathByID(pathID string) (models.AttackPath, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	p, exists := s.paths[pathID]
	return p, exists
}

func (s *AttackGraphService) ExplainPath(pathID string) (string, models.AttackPath) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	p, exists := s.paths[pathID]
	if !exists {
		p = s.paths["PATH-2026-001"]
	}

	explanation := fmt.Sprintf("AI Graph Analysis for %s: %s Root cause: %s Recommended Action: %s",
		p.PathName, p.AIExplanation, p.RootCause, p.RecommendedContainment)

	return explanation, p
}
