package services

import (
	"testing"
)

func TestUEBAService(t *testing.T) {
	service := NewUEBAService()

	t.Run("GetOverview Structure", func(t *testing.T) {
		overview := service.GetOverview()
		if overview.TotalEntitiesMonitored < 2 {
			t.Fatalf("Expected at least 2 monitored entities, got %d", overview.TotalEntitiesMonitored)
		}
		if overview.HighRiskEntitiesCount < 2 {
			t.Errorf("Expected at least 2 high risk entities, got %d", overview.HighRiskEntitiesCount)
		}
	})

	t.Run("GetEntities List", func(t *testing.T) {
		entities := service.GetEntities()
		if len(entities) < 2 {
			t.Errorf("Expected entities list length >= 2, got %d", len(entities))
		}
	})

	t.Run("GetAnomalies List", func(t *testing.T) {
		anomalies := service.GetAnomalies()
		if len(anomalies) < 3 {
			t.Errorf("Expected anomalies list length >= 3, got %d", len(anomalies))
		}
	})

	t.Run("GetEntityRiskProfile Valid Entity", func(t *testing.T) {
		profile, anomalies, found := service.GetEntityRiskProfile("192.168.1.105")
		if !found {
			t.Fatal("Expected entity profile to be found")
		}

		if profile.RiskScore < 90 {
			t.Errorf("Expected risk score >= 90, got %d", profile.RiskScore)
		}

		if len(anomalies) < 2 {
			t.Errorf("Expected at least 2 anomalies for 192.168.1.105, got %d", len(anomalies))
		}
	})

	t.Run("AIBehaviourExplanation Recommendation", func(t *testing.T) {
		aiResp := service.AIBehaviourExplanation("192.168.1.105")
		if aiResp == "" {
			t.Error("Expected non-empty AI explanation string")
		}
	})
}
