package services

import (
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type HealthMonitorService struct {
	mu             sync.RWMutex
	services       map[string]models.ServiceHealth
	totalRequests  int64
	failedRequests int64
}

func NewHealthMonitorService() *HealthMonitorService {
	h := &HealthMonitorService{
		services: make(map[string]models.ServiceHealth),
	}
	h.seedHealthData()
	return h
}

func (h *HealthMonitorService) seedHealthData() {
	now := time.Now()

	h.services = map[string]models.ServiceHealth{
		"Backend API": {
			Name:       "Backend API",
			Status:     "HEALTHY",
			Uptime:     99.9,
			LatencyMs:  12,
			LastCheck:  now,
			ErrorCount: 0,
			Version:    "2.0.0-Enterprise",
		},
		"Frontend Application": {
			Name:       "Frontend Application",
			Status:     "HEALTHY",
			Uptime:     99.8,
			LatencyMs:  18,
			LastCheck:  now,
			ErrorCount: 0,
			Version:    "2.0.0-Enterprise",
		},
		"Database": {
			Name:       "Database",
			Status:     "HEALTHY",
			Uptime:     100.0,
			LatencyMs:  4,
			LastCheck:  now,
			ErrorCount: 0,
			Version:    "PostgreSQL 16",
		},
		"WebSocket Engine": {
			Name:       "WebSocket Engine",
			Status:     "HEALTHY",
			Uptime:     98.9,
			LatencyMs:  5,
			LastCheck:  now,
			ErrorCount: 1,
			Version:    "2.0.0-Realtime",
		},
		"AI Engine": {
			Name:       "AI Engine",
			Status:     "HEALTHY",
			Uptime:     97.8,
			LatencyMs:  45,
			LastCheck:  now,
			ErrorCount: 0,
			Version:    "RAG Copilot v2",
		},
		"Threat Intelligence Engine": {
			Name:       "Threat Intelligence Engine",
			Status:     "HEALTHY",
			Uptime:     99.5,
			LatencyMs:  28,
			LastCheck:  now,
			ErrorCount: 0,
			Version:    "Fusion v2.0",
		},
		"Workflow Engine": {
			Name:       "Workflow Engine",
			Status:     "HEALTHY",
			Uptime:     100.0,
			LatencyMs:  8,
			LastCheck:  now,
			ErrorCount: 0,
			Version:    "SOAR Engine v2",
		},
		"Detection Engine": {
			Name:       "Detection Engine",
			Status:     "HEALTHY",
			Uptime:     99.7,
			LatencyMs:  15,
			LastCheck:  now,
			ErrorCount: 0,
			Version:    "Sigma/YARA v2",
		},
	}
	h.totalRequests = 142850
	h.failedRequests = 120
}

func (h *HealthMonitorService) GetServices() []models.ServiceHealth {
	h.mu.RLock()
	defer h.mu.RUnlock()

	var list []models.ServiceHealth
	for _, s := range h.services {
		list = append(list, s)
	}
	return list
}

func (h *HealthMonitorService) GetPlatformHealth() models.PlatformHealth {
	h.mu.RLock()
	defer h.mu.RUnlock()

	var totalUptime float64
	var totalServices float64
	var servicesList []models.ServiceHealth

	for _, s := range h.services {
		totalUptime += s.Uptime
		totalServices++
		servicesList = append(servicesList, s)
	}

	score := 98
	if totalServices > 0 {
		score = int(totalUptime / totalServices)
	}

	status := "OPTIMAL"
	if score < 95 && score >= 80 {
		status = "WARNING"
	} else if score < 80 {
		status = "DEGRADED"
	}

	return models.PlatformHealth{
		OverallScore:  score,
		OverallStatus: status,
		Services:      servicesList,
		CheckedAt:     time.Now(),
	}
}

func (h *HealthMonitorService) GetMetrics() models.ObservabilityMetricsOverview {
	h.mu.RLock()
	defer h.mu.RUnlock()

	failedPct := 0.08
	if h.totalRequests > 0 {
		failedPct = (float64(h.failedRequests) / float64(h.totalRequests)) * 100
	}

	return models.ObservabilityMetricsOverview{
		API: models.APIMetrics{
			TotalRequests:   h.totalRequests,
			AvgLatencyMs:    18.4,
			FailedRequests:  h.failedRequests,
			ErrorPercentage: failedPct,
		},
		Security: models.PlatformSecurityMetrics{
			AlertsProcessed:      89240,
			IncidentsCreated:     14,
			ThreatHuntsExecuted:  42,
			RulesTriggered:       156,
			WorkflowsExecuted:    28,
			ReportsGenerated:     8,
			ActiveIOCsMonitored:  1250,
			UEBAAnomaliesFlagged: 19,
			Timestamp:            time.Now(),
		},
	}
}
