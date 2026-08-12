package soar

import (
	"context"
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models/events"
	soarmodels "netsentinel-x-backend/models/soar"
	"netsentinel-x-backend/playbooks"
)

type SOAREngine struct {
	mu              sync.RWMutex
	playbookEngine  *PlaybookEngine
	actionExecutor  *ActionExecutor
	approvalManager *ApprovalManager
	policy          *AutomationPolicy
	executions      []soarmodels.SOARExecution
	actionLogs      []soarmodels.SOARActionLog
}

var (
	globalSOAREngine *SOAREngine
	soarOnce         sync.Once
)

func GetSOAREngine() *SOAREngine {
	soarOnce.Do(func() {
		globalSOAREngine = &SOAREngine{
			playbookEngine:  NewPlaybookEngine(),
			actionExecutor:  NewActionExecutor(),
			approvalManager: NewApprovalManager(),
			policy:          NewAutomationPolicy(),
			executions:      make([]soarmodels.SOARExecution, 0, 500),
			actionLogs:      make([]soarmodels.SOARActionLog, 0, 1000),
		}
		globalSOAREngine.seedSampleData()
	})
	return globalSOAREngine
}

func (e *SOAREngine) seedSampleData() {
	sampleExec := playbooks.GenerateBruteForceExecution("EVT-SAMPLE-99")
	e.executions = append(e.executions, sampleExec)
}

func (e *SOAREngine) GetPlaybookEngine() *PlaybookEngine {
	return e.playbookEngine
}

func (e *SOAREngine) GetApprovalManager() *ApprovalManager {
	return e.approvalManager
}

func (e *SOAREngine) ExecutePlaybook(ctx context.Context, pbID, eventID string) (*soarmodels.SOARExecution, error) {
	pb, exists := e.playbookEngine.GetPlaybookByID(pbID)
	if !exists {
		return nil, fmt.Errorf("playbook %s not found", pbID)
	}

	execID := events.GenerateUUID()
	now := time.Now().UTC()
	exec := &soarmodels.SOARExecution{
		ExecutionID:  execID,
		PlaybookID:   pb.ID,
		PlaybookName: pb.Name,
		EventID:      eventID,
		Status:       "RUNNING",
		StartedAt:    now,
		Logs:         []string{fmt.Sprintf("[%s] Playbook %s started", now.Format("15:04:05"), pb.Name)},
	}

	for _, step := range pb.Steps {
		reqApproval := e.policy.RequiresApproval(step.ActionType, pb.RiskThreshold, step.RequireApproval)

		if reqApproval {
			appReq := e.approvalManager.CreateApprovalRequest(execID, pb.Name, step.ActionType, step.Target, "HIGH")
			exec.Status = "AWAITING_APPROVAL"
			exec.Logs = append(exec.Logs, fmt.Sprintf("[%s] Step '%s' (%s) requires approval -> Gate ID: %s", time.Now().Format("15:04:05"), step.Name, step.ActionType, appReq.ID))
			break
		}

		logEntry, err := e.actionExecutor.Execute(ctx, execID, step.ActionType, step.Target, step.Parameters)
		e.mu.Lock()
		if logEntry != nil {
			e.actionLogs = append(e.actionLogs, *logEntry)
		}
		e.mu.Unlock()

		if err != nil {
			exec.Status = "FAILED"
			exec.Result = fmt.Sprintf("Step '%s' failed: %v", step.Name, err)
			exec.Logs = append(exec.Logs, fmt.Sprintf("[%s] Step '%s' failed: %v", time.Now().Format("15:04:05"), step.Name, err))
			break
		}

		exec.Logs = append(exec.Logs, fmt.Sprintf("[%s] Step '%s' executed successfully", time.Now().Format("15:04:05"), step.Name))
	}

	if exec.Status == "RUNNING" {
		exec.Status = "COMPLETED"
		exec.CompletedAt = time.Now().UTC()
		exec.Result = "All playbook response actions executed successfully."
	}

	e.mu.Lock()
	e.executions = append([]soarmodels.SOARExecution{*exec}, e.executions...)
	e.mu.Unlock()

	return exec, nil
}

func (e *SOAREngine) GetExecutions() []soarmodels.SOARExecution {
	e.mu.RLock()
	defer e.mu.RUnlock()

	result := make([]soarmodels.SOARExecution, len(e.executions))
	copy(result, e.executions)
	return result
}

func (e *SOAREngine) GetActionLogs() []soarmodels.SOARActionLog {
	e.mu.RLock()
	defer e.mu.RUnlock()

	result := make([]soarmodels.SOARActionLog, len(e.actionLogs))
	copy(result, e.actionLogs)
	return result
}
