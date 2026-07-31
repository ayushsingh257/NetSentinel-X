package models

import "time"

type FeedProvider string

const (
	ProviderMISP       FeedProvider = "MISP"
	ProviderAlienVault FeedProvider = "ALIENVAULT_OTX"
	ProviderCustomSTIX FeedProvider = "CUSTOM_STIX"
)

type FeedStatus string

const (
	FeedStatusActive   FeedStatus = "ACTIVE"
	FeedStatusSyncing  FeedStatus = "SYNCING"
	FeedStatusInactive FeedStatus = "INACTIVE"
	FeedStatusError    FeedStatus = "ERROR"
)

// IntelFeed represents an external threat intelligence feed source.
type IntelFeed struct {
	ID               string       `json:"id"`
	Name             string       `json:"name"`
	Provider         FeedProvider `json:"provider"`
	FeedURL          string       `json:"feed_url"`
	Status           FeedStatus   `json:"status"`
	LastSyncAt       time.Time    `json:"last_sync_at"`
	ItemCount        int          `json:"item_count"`
	ReliabilityScore float64      `json:"reliability_score"` // 0.0 - 1.0
	CreatedAt        time.Time    `json:"created_at"`
}

// NormalizedIOC represents a standardized Indicator of Compromise entity.
type NormalizedIOC struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"` // IP, DOMAIN, HASH_SHA256, URL
	Value       string    `json:"value"`
	ThreatActor string    `json:"threat_actor"`
	ThreatScore int       `json:"threat_score"` // 0 - 100
	SourceFeed  string    `json:"source_feed"`
	FirstSeen   time.Time `json:"first_seen"`
	LastSeen    time.Time `json:"last_seen"`
	Context     string    `json:"context"`
}

// IOCEnrichmentRequest details parameters for querying threat intelligence context.
type IOCEnrichmentRequest struct {
	Value string `json:"value" binding:"required"`
	Type  string `json:"type"`
}

// IOCEnrichmentResponse presents aggregated enrichment data for an IOC.
type IOCEnrichmentResponse struct {
	Value                 string    `json:"value"`
	Type                  string    `json:"type"`
	Reputation            string    `json:"reputation"` // MALICIOUS, SUSPICIOUS, CLEAN
	ThreatScore           int       `json:"threat_score"`
	GeoLocation           string    `json:"geo_location"`
	ASN                   string    `json:"asn"`
	AssociatedCampaigns   []string  `json:"associated_campaigns"`
	CorrelatedAlertsCount int       `json:"correlated_alerts_count"`
	EnrichedAt            time.Time `json:"enriched_at"`
}

// FeedHealthMetrics aggregates metrics on feed sync state and performance.
type FeedHealthMetrics struct {
	TotalFeeds           int               `json:"total_feeds"`
	ActiveFeeds          int               `json:"active_feeds"`
	TotalIOCsIngested24h int               `json:"total_iocs_ingested_24h"`
	AvgSyncDurationMs    float64           `json:"avg_sync_duration_ms"`
	ProviderBreakdown    map[string]int    `json:"provider_breakdown"`
	HealthStatus         map[string]string `json:"health_status"`
	LastEvaluatedAt      time.Time         `json:"last_evaluated_at"`
}
