package workers

import (
	"context"
	"time"
)

type MetricsAggregationWorker struct {
	name string
}

func NewMetricsAggregationWorker() *MetricsAggregationWorker {
	return &MetricsAggregationWorker{name: "MetricsAggregationWorker"}
}

func (w *MetricsAggregationWorker) Name() string {
	return w.name
}

func (w *MetricsAggregationWorker) Start(ctx context.Context) error {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			// Event queue & metrics aggregation loop
		}
	}
}
