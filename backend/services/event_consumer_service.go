package services

import (
	"log"
	"netsentinel-x-backend/models/events"
)

type EventConsumerService struct {
	bus         *EventBus
	persistence *EventPersistenceService
}

func NewEventConsumerService() *EventConsumerService {
	c := &EventConsumerService{
		bus:         GetEventBus(),
		persistence: GetEventPersistenceService(),
	}
	c.registerDefaultConsumers()
	return c
}

func (c *EventConsumerService) registerDefaultConsumers() {
	// 1. Consumer for threat.detected
	c.bus.Subscribe("threat.detected", "threat-processors", func(evt events.Event) error {
		log.Printf("[EventConsumer] Processing threat.detected: ID=%s, Severity=%s", evt.EventID, evt.Severity)
		c.persistence.PersistEvent(evt)
		return nil
	})

	// 2. Consumer for alerts.created
	c.bus.Subscribe("alerts.created", "alert-processors", func(evt events.Event) error {
		log.Printf("[EventConsumer] Processing alerts.created: ID=%s, Severity=%s", evt.EventID, evt.Severity)
		c.persistence.PersistEvent(evt)
		return nil
	})

	// 3. Consumer for network.telemetry
	c.bus.Subscribe("network.telemetry", "telemetry-processors", func(evt events.Event) error {
		c.persistence.PersistEvent(evt)
		return nil
	})

	// 4. Consumer for system.health
	c.bus.Subscribe("system.health", "health-processors", func(evt events.Event) error {
		c.persistence.PersistEvent(evt)
		return nil
	})
}
