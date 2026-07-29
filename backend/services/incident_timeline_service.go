package services

import (
	"sort"
	"sync"

	"netsentinel-x-backend/models"
)

// IncidentTimelineService reconstructs attack timelines from security audit events.
type IncidentTimelineService struct {
	mu         sync.RWMutex
	auditChain *AuditChainService
}

// NewIncidentTimelineService creates a new IncidentTimelineService instance.
func NewIncidentTimelineService(auditChain *AuditChainService) *IncidentTimelineService {
	return &IncidentTimelineService{
		auditChain: auditChain,
	}
}

// GetTimeline returns chronological attack timeline steps.
func (s *IncidentTimelineService) GetTimeline() []models.IncidentTimelineEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()

	logs := s.auditChain.GetLogs()
	timeline := make([]models.IncidentTimelineEvent, 0, len(logs))

	for _, l := range logs {
		timeline = append(timeline, models.IncidentTimelineEvent{
			ID:        "TLE-" + l.ID,
			Timestamp: l.Timestamp,
			Category:  l.EventType,
			Summary:   l.Action + " on " + l.Resource + " (" + s.detailsSummary(l) + ")",
			Severity:  l.Severity,
			User:      l.Username,
			IP:        l.IPAddress,
		})
	}

	sort.Slice(timeline, func(i, j int) bool {
		return timeline[i].Timestamp.Before(timeline[j].Timestamp)
	})

	return timeline
}

func (s *IncidentTimelineService) detailsSummary(l models.SecurityAuditLog) string {
	if l.Severity == models.SeverityCritical {
		return "CRITICAL threat event detected"
	}
	if l.Severity == models.SeverityHigh {
		return "HIGH severity security event"
	}
	return "Standard security telemetry entry"
}
