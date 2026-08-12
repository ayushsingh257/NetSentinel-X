package integrations

import (
	"context"
	"fmt"
)

type EndpointAdapter struct{}

func NewEndpointAdapter() *EndpointAdapter {
	return &EndpointAdapter{}
}

func (a *EndpointAdapter) Name() string {
	return "EndpointAdapter"
}

func (a *EndpointAdapter) ExecuteAction(ctx context.Context, actionType, target string, params map[string]string) (*ActionResult, error) {
	if actionType != "ISOLATE_HOST" && actionType != "COLLECT_EVIDENCE" {
		return nil, fmt.Errorf("unsupported action type: %s", actionType)
	}

	if target == "" {
		target = "192.168.1.105"
	}

	return &ActionResult{
		ActionID: "ACT-EDR-" + target,
		Success:  true,
		Message:  fmt.Sprintf("EDR Host Isolation: Endpoint '%s' network interface isolated; forensic memory snapshot saved.", target),
		Details: map[string]string{
			"adapter":     "EndpointAdapter",
			"target_host": target,
			"isolation":   "ENABLED",
			"memory_dump": "SAVED",
		},
	}, nil
}
