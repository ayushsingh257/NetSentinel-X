package workers

import (
	"context"
	"time"
)

type AlertEnrichmentWorker struct {
	name string
}

func NewAlertEnrichmentWorker() *AlertEnrichmentWorker {
	return &AlertEnrichmentWorker{name: "AlertEnrichmentWorker"}
}

func (w *AlertEnrichmentWorker) Name() string {
	return w.name
}

func (w *AlertEnrichmentWorker) Start(ctx context.Context) error {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			// Background alert enrichment ticker loop
		}
	}
}
