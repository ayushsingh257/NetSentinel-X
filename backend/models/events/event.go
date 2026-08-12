package events

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"
)

// GenerateUUID creates a pseudo-random UUID v4 string without external dependencies.
func GenerateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40 // Version 4
	b[8] = (b[8] & 0x3f) | 0x80 // Variant RFC 4122
	return fmt.Sprintf("%s-%s-%s-%s-%s",
		hex.EncodeToString(b[0:4]),
		hex.EncodeToString(b[4:6]),
		hex.EncodeToString(b[6:8]),
		hex.EncodeToString(b[8:10]),
		hex.EncodeToString(b[10:16]),
	)
}

// Event represents the canonical enterprise event schema across NetSentinel-X V2.
type Event struct {
	EventID       string                 `json:"event_id"`
	Type          string                 `json:"type"`     // e.g. "threat.detected", "alerts.created", "network.telemetry", "system.health"
	Severity      string                 `json:"severity"` // "info", "low", "medium", "high", "critical"
	Source        string                 `json:"source"`   // e.g. "dpi-engine", "auth-service", "threat-fusion"
	Timestamp     time.Time              `json:"timestamp"`
	Payload       map[string]interface{} `json:"payload"`
	Metadata      map[string]string      `json:"metadata"`
	CorrelationID string                 `json:"correlation_id"`
	Status        string                 `json:"status"` // "PENDING", "PROCESSED", "FAILED", "DLQ"
}

// NewEvent creates a base Event with generated UUIDs and ISO timestamps.
func NewEvent(eventType, severity, source string, payload map[string]interface{}, correlationID string) Event {
	if correlationID == "" {
		correlationID = GenerateUUID()
	}
	if payload == nil {
		payload = make(map[string]interface{})
	}
	return Event{
		EventID:       GenerateUUID(),
		Type:          eventType,
		Severity:      severity,
		Source:        source,
		Timestamp:     time.Now().UTC(),
		Payload:       payload,
		Metadata:      map[string]string{"schema_version": "2.0"},
		CorrelationID: correlationID,
		Status:        "PENDING",
	}
}

// NewThreatDetectionEvent creates a threat.detected event instance.
func NewThreatDetectionEvent(severity, source string, payload map[string]interface{}, correlationID string) Event {
	return NewEvent("threat.detected", severity, source, payload, correlationID)
}

// NewAlertCreatedEvent creates an alerts.created event instance.
func NewAlertCreatedEvent(severity, source string, payload map[string]interface{}, correlationID string) Event {
	return NewEvent("alerts.created", severity, source, payload, correlationID)
}

// NewNetworkTelemetryEvent creates a network.telemetry event instance.
func NewNetworkTelemetryEvent(source string, payload map[string]interface{}, correlationID string) Event {
	return NewEvent("network.telemetry", "info", source, payload, correlationID)
}

// NewSystemHealthEvent creates a system.health event instance.
func NewSystemHealthEvent(severity, source string, payload map[string]interface{}, correlationID string) Event {
	return NewEvent("system.health", severity, source, payload, correlationID)
}
