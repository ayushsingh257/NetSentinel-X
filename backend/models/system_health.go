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
