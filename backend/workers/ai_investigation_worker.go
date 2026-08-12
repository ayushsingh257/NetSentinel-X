package workers

import (
	"context"
	"time"

	"netsentinel-x-backend/models/events"
	"netsentinel-x-backend/services"
)

type AIInvestigationWorker struct {
	name      string
	bus       *services.EventBus
	publisher *services.EventPublisherService
}

func NewAIInvestigationWorker() *AIInvestigationWorker {
	w := &AIInvestigationWorker{
		name:      "AIInvestigationWorker",
		bus:       services.GetEventBus(),
		publisher: services.NewEventPublisherService(),
	}

	w.bus.Subscribe("incident.created", "ai-investigation-group", func(evt events.Event) error {
		_ = w.publisher.Publish(events.NewEvent(
			"ai.investigation.generated",
			"info",
			"ai-investigation-worker",
			map[string]interface{}{
				"incident_id": evt.EventID,
				"status":      "RECONSTRUCTED",
			},
			evt.CorrelationID,
		))
		return nil
	})

	return w
}

func (w *AIInvestigationWorker) Name() string {
	return w.name
}

func (w *AIInvestigationWorker) Start(ctx context.Context) error {
	ticker := time.NewTicker(8 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			// Investigation worker loop
		}
	}
}
