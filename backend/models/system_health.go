package models

import "time"

type ServiceHealth struct {
	Name       string    `json:"name"`
	Status     string    `json:"status"` // "HEALTHY", "WARNING", "DEGRADED", "DOWN"
	Uptime     float64   `json:"uptime"` // percentage e.g. 99.9
	LatencyMs  int64     `json:"latency_ms"`
	LastCheck  time.Time `json:"last_check"`
	ErrorCount int       `json:"error_count"`
	Version    string    `json:"version"`
}

type PlatformHealth struct {
	OverallScore  int             `json:"overall_score"`  // 0 - 100
	OverallStatus string          `json:"overall_status"` // "OPTIMAL", "WARNING", "DEGRADED"
	Services      []ServiceHealth `json:"services"`
	CheckedAt     time.Time       `json:"checked_at"`
}

type SystemHealthDetails struct {
	CPUUsagePercent           float64         `json:"cpu_usage_percent"`
	MemoryUsageMB             float64         `json:"memory_usage_mb"`
	MemoryUsagePercent        float64         `json:"memory_usage_percent"`
	DatabaseStatus            string          `json:"database_status"`
	DBConnectionPoolActive    int             `json:"db_connection_pool_active"`
	RedisStatus               string          `json:"redis_status"`
	WebSocketConnectedClients int             `json:"websocket_connected_clients"`
	EventProcessingRateCPS    float64         `json:"event_processing_rate_cps"`
	ThreatEngineStatus        string          `json:"threat_engine_status"`
	ThreatEngineLatencyMs     float64         `json:"threat_engine_latency_ms"`
	ServiceUptimeSeconds      int64           `json:"service_uptime_seconds"`
	SystemVersion             string          `json:"system_version"`
	Services                  []ServiceHealth `json:"services"`
	CheckedAt                 time.Time       `json:"checked_at"`
}
