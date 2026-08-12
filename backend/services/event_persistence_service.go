package services

import (
	"encoding/json"
	"sync"
	"time"

	"netsentinel-x-backend/models/events"
)

type PersistentEventRecord struct {
	ID            string            `json:"id"`
	EventType     string            `json:"event_type"`
	Severity      string            `json:"severity"`
	Source        string            `json:"source"`
	PayloadTrunc  string            `json:"payload_summary"`
	CorrelationID string            `json:"correlation_id"`
	CreatedAt     time.Time         `json:"created_at"`
	ProcessedAt   time.Time         `json:"processed_at"`
	Status        string            `json:"status"`
	Metadata      map[string]string `json:"metadata"`
}

type EventPersistenceService struct {
	mu      sync.RWMutex
	records []PersistentEventRecord
	maxSize int
}

var (
	globalPersistence *EventPersistenceService
	persistenceOnce   sync.Once
)

func GetEventPersistenceService() *EventPersistenceService {
	persistenceOnce.Do(func() {
		globalPersistence = &EventPersistenceService{
			records: make([]PersistentEventRecord, 0, 1000),
			maxSize: 1000,
		}
		globalPersistence.seedSampleEvents()
	})
	return globalPersistence
}

func (s *EventPersistenceService) seedSampleEvents() {
	now := time.Now().UTC()

	s.records = append(s.records,
		PersistentEventRecord{
			ID:            events.GenerateUUID(),
			EventType:     "threat.detected",
			Severity:      "critical",
			Source:        "dpi-engine",
			PayloadTrunc:  `{"protocol":"TCP","dst_port":445,"signature":"Malware.Win32.Ransomware"}`,
			CorrelationID: events.GenerateUUID(),
			CreatedAt:     now.Add(-10 * time.Minute),
			ProcessedAt:   now.Add(-10 * time.Minute),
			Status:        "PROCESSED",
			Metadata:      map[string]string{"schema_version": "2.0"},
		},
		PersistentEventRecord{
			ID:            events.GenerateUUID(),
			EventType:     "alerts.created",
			Severity:      "high",
			Source:        "alert-service",
			PayloadTrunc:  `{"rule_id":"SIG-9901","title":"Suspicious Outbound Tunneling"}`,
			CorrelationID: events.GenerateUUID(),
			CreatedAt:     now.Add(-5 * time.Minute),
			ProcessedAt:   now.Add(-5 * time.Minute),
			Status:        "PROCESSED",
			Metadata:      map[string]string{"schema_version": "2.0"},
		},
		PersistentEventRecord{
			ID:            events.GenerateUUID(),
			EventType:     "network.telemetry",
			Severity:      "info",
			Source:        "dpi-engine",
			PayloadTrunc:  `{"protocol":"UDP","dst_port":53,"bytes":1240}`,
			CorrelationID: events.GenerateUUID(),
			CreatedAt:     now.Add(-2 * time.Minute),
			ProcessedAt:   now.Add(-2 * time.Minute),
			Status:        "PROCESSED",
			Metadata:      map[string]string{"schema_version": "2.0"},
		},
	)
}

// PersistEvent saves an event record with a truncated JSON payload summary (max 4KB) to prevent unbounded memory growth.
func (s *EventPersistenceService) PersistEvent(evt events.Event) PersistentEventRecord {
	s.mu.Lock()
	defer s.mu.Unlock()

	payloadBytes, _ := json.Marshal(evt.Payload)
	payloadStr := string(payloadBytes)
	if len(payloadStr) > 4096 {
		payloadStr = payloadStr[:4093] + "..."
	}

	rec := PersistentEventRecord{
		ID:            evt.EventID,
		EventType:     evt.Type,
		Severity:      evt.Severity,
		Source:        evt.Source,
		PayloadTrunc:  payloadStr,
		CorrelationID: evt.CorrelationID,
		CreatedAt:     evt.Timestamp,
		ProcessedAt:   time.Now().UTC(),
		Status:        evt.Status,
		Metadata:      evt.Metadata,
	}

	if len(s.records) >= s.maxSize {
		s.records = s.records[1:]
	}
	s.records = append(s.records, rec)
	return rec
}

// GetEventHistory returns historical event records with optional filtering by event type or severity.
func (s *EventPersistenceService) GetEventHistory(eventType, severity string, limit int) []PersistentEventRecord {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var filtered []PersistentEventRecord
	for i := len(s.records) - 1; i >= 0; i-- {
		r := s.records[i]
		if eventType != "" && eventType != "ALL" && r.EventType != eventType {
			continue
		}
		if severity != "" && severity != "ALL" && r.Severity != severity {
			continue
		}
		filtered = append(filtered, r)
		if limit > 0 && len(filtered) >= limit {
			break
		}
	}
	return filtered
}
