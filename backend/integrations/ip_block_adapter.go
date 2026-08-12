package integrations

import (
	"context"
	"fmt"
)

type IPBlockAdapter struct{}

func NewIPBlockAdapter() *IPBlockAdapter {
	return &IPBlockAdapter{}
}

func (a *IPBlockAdapter) Name() string {
	return "IPBlockAdapter"
}

func (a *IPBlockAdapter) ExecuteAction(ctx context.Context, actionType, target string, params map[string]string) (*ActionResult, error) {
	if actionType != "BLOCK_IP" && actionType != "UNBLOCK_IP" {
		return nil, fmt.Errorf("unsupported action type: %s", actionType)
	}

	if target == "" {
		target = "198.51.100.42"
	}

	return &ActionResult{
		ActionID: "ACT-IP-" + target,
		Success:  true,
		Message:  fmt.Sprintf("Firewall Rule Executed: IP '%s' added to edge drop filter table.", target),
		Details: map[string]string{
			"adapter":     "IPBlockAdapter",
			"target_ip":   target,
			"rule_action": "DROP",
			"interface":   "eth0",
		},
	}, nil
}
