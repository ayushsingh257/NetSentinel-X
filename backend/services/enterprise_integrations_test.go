package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"netsentinel-x-backend/models"
)

func TestEnterpriseIntegrationsService(t *testing.T) {
	service := NewEnterpriseIntegrationsService()

	// 1. List Targets
	targets := service.ListIntegrations()
	assert.GreaterOrEqual(t, len(targets), 4)

	// 2. Get Target by ID
	t1, err := service.GetIntegrationByID("INT-SIEM-SPLUNK")
	assert.NoError(t, err)
	assert.Equal(t, "Enterprise Splunk HEC Collector", t1.Name)
	assert.Equal(t, models.CategorySIEM, t1.Category)

	// 3. Create Custom Webhook Target
	newTarget := models.IntegrationTarget{
		Name:      "PagerDuty On-Call Alert Gateway",
		Category:  models.CategoryWebhook,
		Provider:  models.ProviderCustom,
		TargetURL: "https://events.pagerduty.com/v2/enqueue",
		AuthType:  "BEARER_TOKEN",
	}
	created, err := service.CreateIntegration(newTarget)
	assert.NoError(t, err)
	assert.NotEmpty(t, created.ID)
	assert.Equal(t, "ENABLED", created.Status)

	// 4. Update Target
	created.Name = "Updated PagerDuty Gateway"
	updated, err := service.UpdateIntegration(created.ID, created)
	assert.NoError(t, err)
	assert.Equal(t, "Updated PagerDuty Gateway", updated.Name)

	// 5. Test Integration Connectivity
	testRes, err := service.TestIntegration(models.IntegrationTestRequest{
		TargetID:    "INT-SOAR-XSOAR",
		TestMessage: "Ping test from NetSentinel-X V2 Engine",
	})
	assert.NoError(t, err)
	assert.True(t, testRes.Success)
	assert.Equal(t, 200, testRes.ResponseCode)
	assert.Greater(t, testRes.LatencyMs, 0.0)

	// 6. Get Export Pipelines
	pipelines := service.GetExportPipelines()
	assert.GreaterOrEqual(t, len(pipelines), 2)

	// 7. Get Metrics
	metrics := service.GetIntegrationMetrics()
	assert.GreaterOrEqual(t, metrics.TotalIntegrations, 5)
	assert.GreaterOrEqual(t, metrics.ActiveIntegrations, 5)
	assert.Equal(t, 99.98, metrics.DeliverySuccessRate)

	// 8. Delete Target
	err = service.DeleteIntegration(created.ID)
	assert.NoError(t, err)
}
