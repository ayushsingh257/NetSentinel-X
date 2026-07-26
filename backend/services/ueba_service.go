package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type UEBAService struct {
	mu        sync.RWMutex
	entities  map[string]models.EntityProfile
	anomalies map[string]models.AnomalyRecord
}

func NewUEBAService() *UEBAService {
	s := &UEBAService{
		entities:  make(map[string]models.EntityProfile),
		anomalies: make(map[string]models.AnomalyRecord),
	}
	s.seedUEBAData()
	return s
}

func (s *UEBAService) seedUEBAData() {
	// Seed Host 1: 192.168.1.105 (High Risk Workstation)
	e1 := models.EntityProfile{
		ID:                   "ENT-HOST-192-168-1-105",
		EntityType:           "HOST",
		EntityName:           "192.168.1.105 (Workstation-A)",
		RiskScore:            92,
		RiskLevel:            "CRITICAL",
		BaselineConnRate:     12.4,
		BaselinePacketVolume: 450000,
		BaselineProtocolMap: map[string]int{
			"HTTP":  3500,
			"HTTPS": 12000,
			"DNS":   450,
		},
		AnomaliesCount: 4,
		LastActive:     time.Now().Add(-2 * time.Minute),
		CreatedAt:      time.Now().Add(-168 * time.Hour),
		UpdatedAt:      time.Now(),
	}

	// Seed Host 2: 192.168.1.180 (Database Server)
	e2 := models.EntityProfile{
		ID:                   "ENT-HOST-192-168-1-180",
		EntityType:           "HOST",
		EntityName:           "192.168.1.180 (DB-Primary)",
		RiskScore:            78,
		RiskLevel:            "HIGH",
		BaselineConnRate:     8.5,
		BaselinePacketVolume: 1200000,
		BaselineProtocolMap: map[string]int{
			"POSTGRES": 85000,
			"SSH":      400,
		},
		AnomaliesCount: 2,
		LastActive:     time.Now().Add(-5 * time.Minute),
		CreatedAt:      time.Now().Add(-336 * time.Hour),
		UpdatedAt:      time.Now(),
	}

	// Seed Anomalies for e1
	a1 := models.AnomalyRecord{
		ID:                  "ANOM-2026-001",
		EntityID:            e1.ID,
		EntityName:          e1.EntityName,
		AnomalyScore:        94,
		Category:            "Beaconing",
		Reason:              "Strict 60.0s periodic outbound HTTPS communication to suspicious IP 198.51.100.45",
		ObservedBehaviour:   "60 outbound connections with exact 60.0s interval variance < 0.05s",
		ExpectedBehaviour:   "Sporadic human-driven web browsing with connection variance > 12.0s",
		DeviationPercentage: 480.0,
		RelatedAlerts:       []string{"ALT-8001: Suspicious Beaconing"},
		RelatedIOCs:         []string{"198.51.100.45"},
		MITRETechniques:     []string{"T1071.001 - Web Protocols", "T1571 - Non-Standard Port"},
		Timestamp:           time.Now().Add(-15 * time.Minute),
		AIExplanation:       "Entity demonstrates automated periodic beaconing characteristic of Command & Control agent heartbeat callbacks.",
		RecommendedAction:   "Isolate host from local VLAN and inspect memory space for injection.",
	}

	a2 := models.AnomalyRecord{
		ID:                  "ANOM-2026-002",
		EntityID:            e1.ID,
		EntityName:          e1.EntityName,
		AnomalyScore:        89,
		Category:            "Data Exfiltration",
		Reason:              "Unusual outbound data transfer burst of 1.4 GB via DNS TXT subdomains within 3 minutes",
		ObservedBehaviour:   "450 MB/min outbound TXT query payload bandwidth",
		ExpectedBehaviour:   "Average 1.2 KB/min DNS query baseline bandwidth",
		DeviationPercentage: 37500.0,
		RelatedAlerts:       []string{"ALT-8910: High Entropy DNS Query"},
		RelatedIOCs:         []string{"malicious-c2-beacon.example-tunnel.org"},
		MITRETechniques:     []string{"T1048.003 - Exfiltration Over Alternative Protocol"},
		Timestamp:           time.Now().Add(-30 * time.Minute),
		AIExplanation:       "Massive departure from baseline DNS query volume indicating active staging and exfiltration of internal data.",
		RecommendedAction:   "Enforce emergency DNS sinkholing and reset user credentials.",
	}

	a3 := models.AnomalyRecord{
		ID:                  "ANOM-2026-003",
		EntityID:            e2.ID,
		EntityName:          e2.EntityName,
		AnomalyScore:        82,
		Category:            "Brute Force",
		Reason:              "High velocity SSH connection attempts (120 attempts/min) originating from external subnet",
		ObservedBehaviour:   "120 failed SSH auth sequences per minute",
		ExpectedBehaviour:   "0-2 admin logins per hour during business shift",
		DeviationPercentage: 6000.0,
		RelatedAlerts:       []string{"ALT-2041: SSH Port Brute Force"},
		RelatedIOCs:         []string{"192.168.1.180"},
		MITRETechniques:     []string{"T1110 - Brute Force"},
		Timestamp:           time.Now().Add(-45 * time.Minute),
		AIExplanation:       "Credential guessing attack attempting unauthorized SSH administrative access.",
		RecommendedAction:   "Apply dynamic IP ban rule on edge router.",
	}

	s.entities[e1.ID] = e1
	s.entities[e2.ID] = e2
	s.anomalies[a1.ID] = a1
	s.anomalies[a2.ID] = a2
	s.anomalies[a3.ID] = a3
}

func (s *UEBAService) GetOverview() models.UEBAOverview {
	s.mu.RLock()
	defer s.mu.RUnlock()

	highRiskCount := 0
	riskDist := map[string]int{
		"CRITICAL": 0,
		"HIGH":     0,
		"MEDIUM":   0,
		"LOW":      0,
	}

	var leaderboard []models.EntityProfile
	for _, e := range s.entities {
		riskDist[e.RiskLevel]++
		if e.RiskLevel == "CRITICAL" || e.RiskLevel == "HIGH" {
			highRiskCount++
		}
		leaderboard = append(leaderboard, e)
	}

	return models.UEBAOverview{
		TotalEntitiesMonitored: len(s.entities),
		HighRiskEntitiesCount:  highRiskCount,
		ActiveAnomaliesCount:   len(s.anomalies),
		RiskDistribution:       riskDist,
		Leaderboard:            leaderboard,
	}
}

func (s *UEBAService) GetEntities() []models.EntityProfile {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.EntityProfile
	for _, e := range s.entities {
		result = append(result, e)
	}
	return result
}

func (s *UEBAService) GetAnomalies() []models.AnomalyRecord {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.AnomalyRecord
	for _, a := range s.anomalies {
		result = append(result, a)
	}
	return result
}

func (s *UEBAService) GetEntityRiskProfile(entityVal string) (models.EntityProfile, []models.AnomalyRecord, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var matchedEntity models.EntityProfile
	found := false

	for _, e := range s.entities {
		if strings.Contains(strings.ToLower(e.EntityName), strings.ToLower(entityVal)) || strings.Contains(e.ID, entityVal) {
			matchedEntity = e
			found = true
			break
		}
	}

	if !found {
		// Fallback dynamic entity profile for unknown lookups
		matchedEntity = models.EntityProfile{
			ID:                   fmt.Sprintf("ENT-HOST-%s", strings.ReplaceAll(entityVal, ".", "-")),
			EntityType:           "HOST",
			EntityName:           entityVal,
			RiskScore:            85,
			RiskLevel:            "HIGH",
			BaselineConnRate:     10.0,
			BaselinePacketVolume: 500000,
			AnomaliesCount:       1,
			LastActive:           time.Now(),
			CreatedAt:            time.Now().Add(-24 * time.Hour),
			UpdatedAt:            time.Now(),
		}
	}

	var entityAnomalies []models.AnomalyRecord
	for _, a := range s.anomalies {
		if a.EntityID == matchedEntity.ID || strings.Contains(strings.ToLower(a.EntityName), strings.ToLower(entityVal)) {
			entityAnomalies = append(entityAnomalies, a)
		}
	}

	return matchedEntity, entityAnomalies, true
}

func (s *UEBAService) AIBehaviourExplanation(entityVal string) string {
	e, anomalies, found := s.GetEntityRiskProfile(entityVal)
	if !found || len(anomalies) == 0 {
		return fmt.Sprintf("Entity %s baseline activity is currently within normal statistical parameters.", entityVal)
	}

	return fmt.Sprintf("Entity %s exhibits a Composite UEBA Risk Score of %d/100 (%s). Detected %d active anomaly patterns, primary category: %s with %.1f%% deviation from baseline.", e.EntityName, e.RiskScore, e.RiskLevel, len(anomalies), anomalies[0].Category, anomalies[0].DeviationPercentage)
}
