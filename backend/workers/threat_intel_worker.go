package workers

import (
	"context"
	"time"
)

type ThreatIntelWorker struct {
	name string
}

func NewThreatIntelWorker() *ThreatIntelWorker {
	return &ThreatIntelWorker{name: "ThreatIntelWorker"}
}

func (w *ThreatIntelWorker) Name() string {
	return w.name
}

func (w *ThreatIntelWorker) Start(ctx context.Context) error {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			// IOC correlation worker loop
		}
	}
}
