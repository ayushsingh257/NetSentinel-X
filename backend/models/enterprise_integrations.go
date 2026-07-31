package models

import "time"

type IntegrationCategory string

const (
	CategorySIEM    IntegrationCategory = "SIEM"
	CategorySOAR    IntegrationCategory = "SOAR"
	CategoryITSM    IntegrationCategory = "ITSM"
	CategoryWebhook IntegrationCategory = "WEBHOOK"
)

type IntegrationProvider string

const (
	ProviderSplunk     IntegrationProvider = "SPLUNK"
	ProviderElastic    IntegrationProvider = "ELASTIC"
	ProviderQRadar     IntegrationProvider = "QRADAR"
	ProviderServiceNow IntegrationProvider = "SERVICENOW"
	ProviderJira       IntegrationProvider = "JIRA"
	ProviderXSOAR      IntegrationProvider = "PALO_ALTO_XSOAR"
	ProviderCustom     IntegrationProvider = "CUSTOM_WEBHOOK"
)

type ExportFormat string

const (
	FormatCEF    ExportFormat = "CEF"
	FormatLEEF   ExportFormat = "LEEF"
	FormatSyslog ExportFormat = "SYSLOG"
	FormatJSON   ExportFormat = "JSON"
)

// IntegrationTarget defines an enterprise integration destination entity.
type IntegrationTarget struct {
	ID          string              `json:"id"`
	Name        string              `json:"name"`
	Category    IntegrationCategory `json:"category"`
	Provider    IntegrationProvider `json:"provider"`
	TargetURL   string              `json:"target_url"`
	AuthType    string              `json:"auth_type"` // API_KEY, OAUTH2, BASIC, MUTUAL_TLS
	Status      string              `json:"status"`    // ENABLED, DISABLED, ERROR
	Reliability float64             `json:"reliability_score"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
}

// ExportPipelineConfig details configuration for log export formats.
type ExportPipelineConfig struct {
	ID             string       `json:"id"`
	Name           string       `json:"name"`
	Format         ExportFormat `json:"format"`
	DestinationURL string       `json:"destination_url"`
	Enabled        bool         `json:"enabled"`
	Compression    bool         `json:"compression"`
	CreatedAt      time.Time    `json:"created_at"`
}

// IntegrationTestRequest details parameters for testing an integration target.
type IntegrationTestRequest struct {
	TargetID    string `json:"target_id" binding:"required"`
	TestMessage string `json:"test_message"`
}

// IntegrationTestResult details execution results of an integration test.
type IntegrationTestResult struct {
	Success      bool      `json:"success"`
	TargetID     string    `json:"target_id"`
	ResponseCode int       `json:"response_code"`
	LatencyMs    float64   `json:"latency_ms"`
	ErrorMessage string    `json:"error_message,omitempty"`
	TestedAt     time.Time `json:"tested_at"`
}

// IntegrationMetrics presents analytical metrics on integration delivery health.
type IntegrationMetrics struct {
	TotalIntegrations   int            `json:"total_integrations"`
	ActiveIntegrations  int            `json:"active_integrations"`
	EventsExported24h   int            `json:"events_exported_24h"`
	DeliverySuccessRate float64        `json:"delivery_success_rate"` // e.g. 99.8%
	LatencyP95Ms        float64        `json:"latency_p95_ms"`
	CategoryBreakdown   map[string]int `json:"category_breakdown"`
	LastEvaluatedAt     time.Time      `json:"last_evaluated_at"`
}
