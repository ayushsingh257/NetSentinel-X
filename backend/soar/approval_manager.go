package soar

import (
	"sync"
	"time"

	"netsentinel-x-backend/models/events"
	soarmodels "netsentinel-x-backend/models/soar"
)

type ApprovalManager struct {
	mu        sync.RWMutex
	approvals map[string]*soarmodels.SOARApprovalRequest
}

func NewApprovalManager() *ApprovalManager {
	am := &ApprovalManager{
		approvals: make(map[string]*soarmodels.SOARApprovalRequest),
	}
	am.seedDefaultApprovals()
	return am
}

func (m *ApprovalManager) seedDefaultApprovals() {
	now := time.Now().UTC()
	req1 := &soarmodels.SOARApprovalRequest{
		ID:           "APR-9901",
		ExecutionID:  events.GenerateUUID(),
		PlaybookName: "Automated Brute Force Mitigation Playbook",
		ActionType:   "DISABLE_USER",
		Target:       "user_ayush",
		RiskLevel:    "HIGH",
		RequestedAt:  now.Add(-15 * time.Minute),
		Status:       "PENDING",
	}
	m.approvals[req1.ID] = req1
}

func (m *ApprovalManager) CreateApprovalRequest(execID, pbName, actionType, target, risk string) *soarmodels.SOARApprovalRequest {
	m.mu.Lock()
	defer m.mu.Unlock()

	req := &soarmodels.SOARApprovalRequest{
		ID:           "APR-" + events.GenerateUUID()[:8],
		ExecutionID:  execID,
		PlaybookName: pbName,
		ActionType:   actionType,
		Target:       target,
		RiskLevel:    risk,
		RequestedAt:  time.Now().UTC(),
		Status:       "PENDING",
	}
	m.approvals[req.ID] = req
	return req
}

func (m *ApprovalManager) GetPendingApprovals() []soarmodels.SOARApprovalRequest {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var list []soarmodels.SOARApprovalRequest
	for _, req := range m.approvals {
		if req.Status == "PENDING" {
			list = append(list, *req)
		}
	}
	return list
}

func (m *ApprovalManager) DecideApproval(id string, approve bool, decidedBy string) (*soarmodels.SOARApprovalRequest, bool) {
	m.mu.Lock()
	defer m.mu.Unlock()

	req, exists := m.approvals[id]
	if !exists || req.Status != "PENDING" {
		return nil, false
	}

	now := time.Now().UTC()
	req.DecidedBy = decidedBy
	req.DecidedAt = now

	if approve {
		req.Status = "APPROVED"
	} else {
		req.Status = "REJECTED"
	}

	return req, true
}
