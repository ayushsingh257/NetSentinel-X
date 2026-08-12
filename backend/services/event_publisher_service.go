package services

import (
	"fmt"
	"netsentinel-x-backend/models/events"
)

type EventPublisherService struct {
	bus *EventBus
}

func NewEventPublisherService() *EventPublisherService {
	return &EventPublisherService{
		bus: GetEventBus(),
	}
}

// Publish Event validates the schema and publishes it to the event bus.
func (p *EventPublisherService) Publish(evt events.Event) error {
	if evt.Type == "" {
		return fmt.Errorf("event type is required")
	}
	if evt.EventID == "" {
		evt.EventID = events.GenerateUUID()
	}
	if evt.CorrelationID == "" {
		evt.CorrelationID = events.GenerateUUID()
	}

	p.bus.Publish(evt)
	return nil
}

// PublishThreatDetected helper to publish a threat.detected event.
func (p *EventPublisherService) PublishThreatDetected(severity, source string, payload map[string]interface{}, correlationID string) error {
	evt := events.NewThreatDetectionEvent(severity, source, payload, correlationID)
	return p.Publish(evt)
}

// PublishAlertCreated helper to publish an alerts.created event.
func (p *EventPublisherService) PublishAlertCreated(severity, source string, payload map[string]interface{}, correlationID string) error {
	evt := events.NewAlertCreatedEvent(severity, source, payload, correlationID)
	return p.Publish(evt)
}

// PublishNetworkTelemetry helper to publish a network.telemetry event.
func (p *EventPublisherService) PublishNetworkTelemetry(source string, payload map[string]interface{}, correlationID string) error {
	evt := events.NewNetworkTelemetryEvent(source, payload, correlationID)
	return p.Publish(evt)
}

// PublishSystemHealth helper to publish a system.health event.
func (p *EventPublisherService) PublishSystemHealth(severity, source string, payload map[string]interface{}, correlationID string) error {
	evt := events.NewSystemHealthEvent(severity, source, payload, correlationID)
	return p.Publish(evt)
}
