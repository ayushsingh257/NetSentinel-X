package workers

import (
	"context"
	"time"

	"netsentinel-x-backend/ai"
	"netsentinel-x-backend/models/events"
	"netsentinel-x-backend/services"
)

type AIAlertTriageWorker struct {
	name      string
	engine    *ai.AIEngine
	bus       *services.EventBus
	publisher *services.EventPublisherService
}

func NewAIAlertTriageWorker() *AIAlertTriageWorker {
	engine := ai.NewAIEngine(ai.NewDeterministicMockProvider())
	w := &AIAlertTriageWorker{
		name:      "AIAlertTriageWorker",
		engine:    engine,
		bus:       services.GetEventBus(),
		publisher: services.NewEventPublisherService(),
	}

	w.bus.Subscribe("alerts.created", "ai-triage-group", func(evt events.Event) error {
		_ = w.publisher.Publish(events.NewEvent(
			"ai.alert.classified",
			evt.Severity,
			"ai-alert-triage",
			map[string]interface{}{
				"alert_id":            evt.EventID,
				"false_positive_prob": 0.05,
			},
			evt.CorrelationID,
		))
		return nil
	})

	return w
}

func (w *AIAlertTriageWorker) Name() string {
	return w.name
}

func (w *AIAlertTriageWorker) Start(ctx context.Context) error {
	ticker := time.NewTicker(6 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			// Triage worker loop
		}
	}
}
