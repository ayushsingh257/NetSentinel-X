package workers

import (
	"context"
	"time"

	"netsentinel-x-backend/models/events"
	"netsentinel-x-backend/services"
	"netsentinel-x-backend/soar"
)

type SOARExecutionWorker struct {
	name       string
	soarEngine *soar.SOAREngine
	bus        *services.EventBus
	publisher  *services.EventPublisherService
	auditSvc   *services.SOARAuditService
}

func NewSOARExecutionWorker() *SOARExecutionWorker {
	w := &SOARExecutionWorker{
		name:       "SOARExecutionWorker",
		soarEngine: soar.GetSOAREngine(),
		bus:        services.GetEventBus(),
		publisher:  services.NewEventPublisherService(),
		auditSvc:   services.GetSOARAuditService(),
	}

	w.bus.Subscribe("ai.analysis.completed", "soar-execution-group", func(evt events.Event) error {
		ctx := context.Background()
		exec, err := w.soarEngine.ExecutePlaybook(ctx, "PB-BRUTE-FORCE-01", evt.EventID)
		if err == nil && exec != nil {
			_ = w.publisher.Publish(events.NewEvent(
				"soar.playbook.started",
				"info",
				"soar-worker",
				map[string]interface{}{
					"execution_id":  exec.ExecutionID,
					"playbook_id":   exec.PlaybookID,
					"playbook_name": exec.PlaybookName,
				},
				evt.CorrelationID,
			))

			w.auditSvc.RecordAction(
				exec.ExecutionID,
				exec.PlaybookName,
				"BLOCK_IP",
				"198.51.100.42",
				"AI_ANALYSIS_ENGINE",
				"High confidence threat event triggered automated SOAR playbook execution.",
				"AUTO_APPROVED",
				"SOARExecutionWorker",
				time.Now().UTC(),
			)
		}
		return nil
	})

	return w
}

func (w *SOARExecutionWorker) Name() string {
	return w.name
}

func (w *SOARExecutionWorker) Start(ctx context.Context) error {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			// SOAR execution loop ticker
		}
	}
}
