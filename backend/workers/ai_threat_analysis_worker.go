package workers

import (
	"context"
	"time"

	"netsentinel-x-backend/ai"
	"netsentinel-x-backend/models/events"
	"netsentinel-x-backend/services"
)

type AIThreatAnalysisWorker struct {
	name      string
	engine    *ai.AIEngine
	bus       *services.EventBus
	publisher *services.EventPublisherService
	storage   *services.AIPersistenceService
}

func NewAIThreatAnalysisWorker() *AIThreatAnalysisWorker {
	engine := ai.NewAIEngine(ai.NewDeterministicMockProvider())
	w := &AIThreatAnalysisWorker{
		name:      "AIThreatAnalysisWorker",
		engine:    engine,
		bus:       services.GetEventBus(),
		publisher: services.NewEventPublisherService(),
		storage:   services.GetAIPersistenceService(),
	}

	w.bus.Subscribe("threat.detected", "ai-analysis-group", func(evt events.Event) error {
		res, err := w.engine.AnalyzeEvent(context.Background(), evt)
		if err == nil && res != nil {
			w.storage.SaveAnalysisResult(*res)
			_ = w.publisher.Publish(events.NewEvent(
				"ai.analysis.completed",
				res.Classification,
				"ai-engine",
				map[string]interface{}{
					"analysis_id": res.ID,
					"risk_score":  res.RiskScore,
				},
				evt.CorrelationID,
			))
		}
		return nil
	})

	return w
}

func (w *AIThreatAnalysisWorker) Name() string {
	return w.name
}

func (w *AIThreatAnalysisWorker) Start(ctx context.Context) error {
	ticker := time.NewTicker(4 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			// Background ticker
		}
	}
}
