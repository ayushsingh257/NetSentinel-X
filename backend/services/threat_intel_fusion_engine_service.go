package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// ThreatIntelFusionEngineService manages threat intelligence feed aggregation, IOC scoring, enrichment, and correlation for Era 35.
type ThreatIntelFusionEngineService struct {
	mu    sync.RWMutex
	feeds map[string]models.IntelFeed
	iocs  map[string]models.NormalizedIOC
}

func NewThreatIntelFusionEngineService() *ThreatIntelFusionEngineService {
	s := &ThreatIntelFusionEngineService{
		feeds: make(map[string]models.IntelFeed),
		iocs:  make(map[string]models.NormalizedIOC),
	}
	s.seedDefaults()
	return s
}

func (s *ThreatIntelFusionEngineService) seedDefaults() {
	now := time.Now()
	f1 := models.IntelFeed{
		ID:               "FEED-MISP-01",
		Name:             "MISP Cyber Threat Exchange",
		Provider:         models.ProviderMISP,
		FeedURL:          "https://misp.netsentinel.io/feed",
		Status:           models.FeedStatusActive,
		LastSyncAt:       now.Add(-15 * time.Minute),
		ItemCount:        14500,
		ReliabilityScore: 0.98,
		CreatedAt:        now.Add(-30 * 24 * time.Hour),
	}

	f2 := models.IntelFeed{
		ID:               "FEED-OTX-02",
		Name:             "AlienVault OTX Pulse Stream",
		Provider:         models.ProviderAlienVault,
		FeedURL:          "https://otx.alienvault.com/api/v1/pulses/subscribed",
		Status:           models.FeedStatusActive,
		LastSyncAt:       now.Add(-30 * time.Minute),
		ItemCount:        28900,
		ReliabilityScore: 0.95,
		CreatedAt:        now.Add(-60 * 24 * time.Hour),
	}

	f3 := models.IntelFeed{
		ID:               "FEED-CUSTOM-03",
		Name:             "STIX/TAXII Custom Enterprise Feed",
		Provider:         models.ProviderCustomSTIX,
		FeedURL:          "https://taxii.enterprise-sec.org/stix/v2",
		Status:           models.FeedStatusActive,
		LastSyncAt:       now.Add(-5 * time.Minute),
		ItemCount:        5200,
		ReliabilityScore: 0.99,
		CreatedAt:        now.Add(-15 * 24 * time.Hour),
	}

	s.feeds[f1.ID] = f1
	s.feeds[f2.ID] = f2
	s.feeds[f3.ID] = f3

	ioc1 := models.NormalizedIOC{
		ID:          "IOC-185.220.101.5",
		Type:        "IP",
		Value:       "185.220.101.5",
		ThreatActor: "APT29 (Cozy Bear)",
		ThreatScore: 95,
		SourceFeed:  "MISP Cyber Threat Exchange",
		FirstSeen:   now.Add(-48 * time.Hour),
		LastSeen:    now.Add(-10 * time.Minute),
		Context:     "Active Tor exit node linked to C2 beacon infrastructure.",
	}

	ioc2 := models.NormalizedIOC{
		ID:          "IOC-evil-domain.com",
		Type:        "DOMAIN",
		Value:       "malicious-update-server.org",
		ThreatActor: "Lazarus Group",
		ThreatScore: 92,
		SourceFeed:  "AlienVault OTX Pulse Stream",
		FirstSeen:   now.Add(-72 * time.Hour),
		LastSeen:    now.Add(-1 * time.Hour),
		Context:     "Phishing landing page targeting staging API keys.",
	}

	s.iocs[ioc1.ID] = ioc1
	s.iocs[ioc2.ID] = ioc2
}

func (s *ThreatIntelFusionEngineService) ListFeeds() []models.IntelFeed {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []models.IntelFeed
	for _, f := range s.feeds {
		list = append(list, f)
	}
	return list
}

func (s *ThreatIntelFusionEngineService) SyncFeed(id string) (models.IntelFeed, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	feed, exists := s.feeds[id]
	if !exists {
		return models.IntelFeed{}, fmt.Errorf("feed %s not found", id)
	}

	feed.Status = models.FeedStatusActive
	feed.LastSyncAt = time.Now()
	feed.ItemCount += 120

	s.feeds[id] = feed
	return feed, nil
}

func (s *ThreatIntelFusionEngineService) GetNormalizedIOCs() []models.NormalizedIOC {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []models.NormalizedIOC
	for _, ioc := range s.iocs {
		list = append(list, ioc)
	}
	return list
}

func (s *ThreatIntelFusionEngineService) EnrichIOC(req models.IOCEnrichmentRequest) (models.IOCEnrichmentResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	val := strings.TrimSpace(req.Value)
	reputation := "SUSPICIOUS"
	score := 75
	geo := "DE (Germany)"
	asn := "AS24940 (Hetzner Online GmbH)"
	campaigns := []string{"Operation GhostWriter", "Phishing Campaign #442"}

	if strings.Contains(val, "185.220") || strings.Contains(val, "malicious") {
		reputation = "MALICIOUS"
		score = 95
		campaigns = append(campaigns, "Cobalt Strike C2 Infrastructure")
	} else if strings.Contains(val, "127.0.0.1") || strings.Contains(val, "localhost") {
		reputation = "CLEAN"
		score = 0
		geo = "INTERNAL"
		asn = "LOCAL"
		campaigns = []string{}
	}

	return models.IOCEnrichmentResponse{
		Value:                 val,
		Type:                  req.Type,
		Reputation:            reputation,
		ThreatScore:           score,
		GeoLocation:           geo,
		ASN:                   asn,
		AssociatedCampaigns:   campaigns,
		CorrelatedAlertsCount: 14,
		EnrichedAt:            time.Now(),
	}, nil
}

func (s *ThreatIntelFusionEngineService) GetFeedHealthMetrics() models.FeedHealthMetrics {
	s.mu.RLock()
	defer s.mu.RUnlock()

	active := 0
	providerMap := make(map[string]int)
	healthMap := make(map[string]string)

	for _, f := range s.feeds {
		if f.Status == models.FeedStatusActive {
			active++
		}
		providerMap[string(f.Provider)]++
		healthMap[f.Name] = string(f.Status)
	}

	return models.FeedHealthMetrics{
		TotalFeeds:           len(s.feeds),
		ActiveFeeds:          active,
		TotalIOCsIngested24h: 48600,
		AvgSyncDurationMs:    340.5,
		ProviderBreakdown:    providerMap,
		HealthStatus:         healthMap,
		LastEvaluatedAt:      time.Now(),
	}
}
