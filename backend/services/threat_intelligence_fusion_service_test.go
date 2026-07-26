package services

import (
	"testing"
)

func TestThreatIntelligenceFusionService(t *testing.T) {
	service := NewThreatIntelligenceFusionService()

	t.Run("GetOverview Returns Valid Stats", func(t *testing.T) {
		overview := service.GetOverview()
		if overview.TotalIOCsEnriched < 2 {
			t.Fatalf("Expected at least 2 seeded IOCs, got %d", overview.TotalIOCsEnriched)
		}
		if overview.ActiveProvidersCount != 8 {
			t.Errorf("Expected 8 active threat providers, got %d", overview.ActiveProvidersCount)
		}
	})

	t.Run("Lookup Seeded IP IOC", func(t *testing.T) {
		record, found := service.LookupIOC("192.168.1.105")
		if !found {
			t.Fatal("Expected IP 192.168.1.105 to be found in intelligence cache")
		}

		if record.ThreatScore < 90 {
			t.Errorf("Expected threat score >= 90, got %d", record.ThreatScore)
		}

		vtResult, exists := record.ProviderResults["VirusTotal"]
		if !exists || vtResult.Status != "MALICIOUS" {
			t.Error("Expected VirusTotal result status MALICIOUS")
		}
	})

	t.Run("Dynamic Fallback Enrichment", func(t *testing.T) {
		record := service.EnrichIOC("unknown-suspicious-domain.com")
		if record.Value != "unknown-suspicious-domain.com" {
			t.Errorf("Expected enriched record value to match query")
		}
		if record.Type != "DOMAIN" {
			t.Errorf("Expected IOC type DOMAIN, got %s", record.Type)
		}
	})

	t.Run("Get History Log", func(t *testing.T) {
		history := service.GetHistory()
		if len(history) < 2 {
			t.Errorf("Expected history log length >= 2, got %d", len(history))
		}
	})
}
