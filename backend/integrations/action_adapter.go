package integrations

import (
	"context"
	"fmt"
)

type ActionResult struct {
	ActionID string            `json:"action_id"`
	Success  bool              `json:"success"`
	Message  string            `json:"message"`
	Details  map[string]string `json:"details"`
}

type ActionAdapter interface {
	Name() string
	ExecuteAction(ctx context.Context, actionType, target string, params map[string]string) (*ActionResult, error)
}

type Dispatcher struct {
	adapters map[string]ActionAdapter
}

func NewDispatcher() *Dispatcher {
	d := &Dispatcher{adapters: make(map[string]ActionAdapter)}
	d.Register(NewIPBlockAdapter())
	d.Register(NewIdentityAdapter())
	d.Register(NewEndpointAdapter())
	d.Register(NewTicketingAdapter())
	return d
}

func (d *Dispatcher) Register(adapter ActionAdapter) {
	d.adapters[adapter.Name()] = adapter
}

func (d *Dispatcher) Dispatch(ctx context.Context, actionType, target string, params map[string]string) (*ActionResult, error) {
	for _, adapter := range d.adapters {
		res, err := adapter.ExecuteAction(ctx, actionType, target, params)
		if err == nil && res != nil {
			return res, nil
		}
	}
	return nil, fmt.Errorf("no adapter handled action type '%s'", actionType)
}
