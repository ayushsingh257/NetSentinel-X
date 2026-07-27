package models

import "time"

type APIMetrics struct {
	TotalRequests   int64   `json:"total_requests"`
	AvgLatencyMs    float64 `json:"avg_latency_ms"`
	FailedRequests  int64   `json:"failed_requests"`
	ErrorPercentage float64 `json:"error_percentage"`
}

type PlatformSecurityMetrics struct {
	AlertsProcessed      int64     `json:"alerts_processed"`
	IncidentsCreated     int64     `json:"incidents_created"`
	ThreatHuntsExecuted  int64     `json:"threat_hunts_executed"`
	RulesTriggered       int64     `json:"rules_triggered"`
	WorkflowsExecuted    int64     `json:"workflows_executed"`
	ReportsGenerated     int64     `json:"reports_generated"`
	ActiveIOCsMonitored  int64     `json:"active_iocs_monitored"`
	UEBAAnomaliesFlagged int64     `json:"ueba_anomalies_flagged"`
	Timestamp            time.Time `json:"timestamp"`
}

type ObservabilityMetricsOverview struct {
	API      APIMetrics              `json:"api"`
	Security PlatformSecurityMetrics `json:"security"`
}
