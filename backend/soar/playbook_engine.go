package soar

import (
	"sync"

	"netsentinel-x-backend/playbooks"

	soarmodels "netsentinel-x-backend/models/soar"
)

type PlaybookEngine struct {
	mu        sync.RWMutex
	playbooks map[string]soarmodels.SOARPlaybook
}

func NewPlaybookEngine() *PlaybookEngine {
	pe := &PlaybookEngine{
		playbooks: make(map[string]soarmodels.SOARPlaybook),
	}
	pe.registerDefaultPlaybooks()
	return pe
}

func (pe *PlaybookEngine) registerDefaultPlaybooks() {
	pb1 := playbooks.NewBruteForcePlaybook()
	pb2 := playbooks.NewMalwarePlaybook()
	pb3 := playbooks.NewDataExfiltrationPlaybook()
	pb4 := playbooks.NewPhishingPlaybook()
	pb5 := playbooks.NewCriticalAlertPlaybook()

	pe.playbooks[pb1.ID] = pb1
	pe.playbooks[pb2.ID] = pb2
	pe.playbooks[pb3.ID] = pb3
	pe.playbooks[pb4.ID] = pb4
	pe.playbooks[pb5.ID] = pb5
}

func (pe *PlaybookEngine) GetPlaybooks() []soarmodels.SOARPlaybook {
	pe.mu.RLock()
	defer pe.mu.RUnlock()

	var result []soarmodels.SOARPlaybook
	for _, pb := range pe.playbooks {
		result = append(result, pb)
	}
	return result
}

func (pe *PlaybookEngine) GetPlaybookByID(id string) (soarmodels.SOARPlaybook, bool) {
	pe.mu.RLock()
	defer pe.mu.RUnlock()

	pb, exists := pe.playbooks[id]
	return pb, exists
}
