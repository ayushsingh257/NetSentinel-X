package soar

import (
	"context"
	"time"

	"netsentinel-x-backend/integrations"
	soarmodels "netsentinel-x-backend/models/soar"
)

type ActionExecutor struct {
	dispatcher *integrations.Dispatcher
}

func NewActionExecutor() *ActionExecutor {
	return &ActionExecutor{
		dispatcher: integrations.NewDispatcher(),
	}
}

func (e *ActionExecutor) Execute(ctx context.Context, execID, actionType, target string, params map[string]string) (*soarmodels.SOARActionLog, error) {
	startTime := time.Now().UTC()
	res, err := e.dispatcher.Dispatch(ctx, actionType, target, params)
	if err != nil {
		return &soarmodels.SOARActionLog{
			ActionID:       "ACT-" + actionType,
			ExecutionID:    execID,
			ActionType:     actionType,
			Target:         target,
			ApprovalStatus: "FAILED",
			ExecutedBy:     "SOAR_ENGINE",
			Timestamp:      startTime,
			Details:        map[string]string{"error": err.Error()},
		}, err
	}

	return &soarmodels.SOARActionLog{
		ActionID:       res.ActionID,
		ExecutionID:    execID,
		ActionType:     actionType,
		Target:         target,
		ApprovalStatus: "EXECUTED",
		ExecutedBy:     "SOAR_ENGINE",
		Timestamp:      startTime,
		Details:        res.Details,
	}, nil
}
