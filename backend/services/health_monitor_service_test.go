package services

import (
	"testing"
)

func TestHealthMonitorService(t *testing.T) {
	service := NewHealthMonitorService()

	t.Run("GetServices Returns 8 Services", func(t *testing.T) {
		services := service.GetServices()
		if len(services) < 8 {
			t.Fatalf("Expected 8 monitored services, got %d", len(services))
		}
	})

	t.Run("GetPlatformHealth Calculates Score", func(t *testing.T) {
		health := service.GetPlatformHealth()
		if health.OverallScore < 90 {
			t.Errorf("Expected overall health score >= 90, got %d", health.OverallScore)
		}
		if health.OverallStatus != "OPTIMAL" {
			t.Errorf("Expected overall status OPTIMAL, got %s", health.OverallStatus)
		}
	})

	t.Run("GetMetrics Returns Valid Overview", func(t *testing.T) {
		metrics := service.GetMetrics()
		if metrics.API.TotalRequests < 100000 {
			t.Errorf("Expected total requests > 100000, got %d", metrics.API.TotalRequests)
		}
		if metrics.Security.AlertsProcessed < 50000 {
			t.Errorf("Expected alerts processed > 50000, got %d", metrics.Security.AlertsProcessed)
		}
	})
}
