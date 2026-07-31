package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"netsentinel-x-backend/models"
)

func TestThreatIntelFusionEngineService(t *testing.T) {
	service := NewThreatIntelFusionEngineService()

	// 1. List Feeds
	feeds := service.ListFeeds()
	assert.GreaterOrEqual(t, len(feeds), 3)

	// 2. Sync Feed
	synced, err := service.SyncFeed("FEED-MISP-01")
	assert.NoError(t, err)
	assert.Equal(t, models.FeedStatusActive, synced.Status)
	assert.Greater(t, synced.ItemCount, 14500)

	// 3. Get Normalized IOCs
	iocs := service.GetNormalizedIOCs()
	assert.GreaterOrEqual(t, len(iocs), 2)

	// 4. Enrich Malicious IOC
	enrichMal, err := service.EnrichIOC(models.IOCEnrichmentRequest{
		Value: "185.220.101.5",
		Type:  "IP",
	})
	assert.NoError(t, err)
	assert.Equal(t, "MALICIOUS", enrichMal.Reputation)
	assert.Equal(t, 95, enrichMal.ThreatScore)
	assert.NotEmpty(t, enrichMal.GeoLocation)

	// 5. Enrich Clean IOC
	enrichClean, err := service.EnrichIOC(models.IOCEnrichmentRequest{
		Value: "127.0.0.1",
		Type:  "IP",
	})
	assert.NoError(t, err)
	assert.Equal(t, "CLEAN", enrichClean.Reputation)
	assert.Equal(t, 0, enrichClean.ThreatScore)

	// 6. Get Feed Health Metrics
	health := service.GetFeedHealthMetrics()
	assert.Equal(t, 3, health.TotalFeeds)
	assert.Equal(t, 3, health.ActiveFeeds)
	assert.Equal(t, 48600, health.TotalIOCsIngested24h)
}
