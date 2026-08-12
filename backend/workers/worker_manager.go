package workers

import (
	"context"
	"sync"
	"time"

	"netsentinel-x-backend/middleware"
)

type Worker interface {
	Name() string
	Start(ctx context.Context) error
}

type WorkerStatus struct {
	Name       string    `json:"name"`
	Status     string    `json:"status"` // "RUNNING", "STOPPED", "ERROR"
	LastActive time.Time `json:"last_active"`
	Processed  int64     `json:"processed"`
	Errors     int64     `json:"errors"`
}

type WorkerManager struct {
	mu      sync.RWMutex
	workers []Worker
	cancel  context.CancelFunc
	status  map[string]*WorkerStatus
}

var (
	globalWorkerManager *WorkerManager
	workerManagerOnce   sync.Once
)

func GetWorkerManager() *WorkerManager {
	workerManagerOnce.Do(func() {
		ctx, cancel := context.WithCancel(context.Background())
		globalWorkerManager = &WorkerManager{
			workers: make([]Worker, 0),
			cancel:  cancel,
			status:  make(map[string]*WorkerStatus),
		}

		// Register standard background workers
		globalWorkerManager.RegisterWorker(NewAlertEnrichmentWorker())
		globalWorkerManager.RegisterWorker(NewThreatIntelWorker())
		globalWorkerManager.RegisterWorker(NewMetricsAggregationWorker())
		globalWorkerManager.RegisterWorker(NewAIThreatAnalysisWorker())
		globalWorkerManager.RegisterWorker(NewAIAlertTriageWorker())
		globalWorkerManager.RegisterWorker(NewAIInvestigationWorker())
		globalWorkerManager.StartAll(ctx)
	})
	return globalWorkerManager
}

func (m *WorkerManager) RegisterWorker(w Worker) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.workers = append(m.workers, w)
	m.status[w.Name()] = &WorkerStatus{
		Name:       w.Name(),
		Status:     "INITIALIZING",
		LastActive: time.Now().UTC(),
		Processed:  0,
		Errors:     0,
	}
}

func (m *WorkerManager) StartAll(ctx context.Context) {
	m.mu.Lock()
	defer m.mu.Unlock()

	middleware.UpdateActiveWorkers(float64(len(m.workers)))

	for _, w := range m.workers {
		st := m.status[w.Name()]
		st.Status = "RUNNING"
		st.LastActive = time.Now().UTC()

		go func(worker Worker) {
			_ = worker.Start(ctx)
		}(w)
	}
}

func (m *WorkerManager) GetWorkerStatuses() []WorkerStatus {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var result []WorkerStatus
	for _, st := range m.status {
		stCopy := *st
		stCopy.LastActive = time.Now().UTC()
		result = append(result, stCopy)
	}
	return result
}

func (m *WorkerManager) Shutdown() {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.cancel != nil {
		m.cancel()
	}
	for _, st := range m.status {
		st.Status = "STOPPED"
	}
	middleware.UpdateActiveWorkers(0)
}
