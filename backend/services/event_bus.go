package services

import (
	"sync"
	"time"

	"netsentinel-x-backend/models/events"
)

type EventHandler func(event events.Event) error

type Subscription struct {
	ID      string
	Topic   string
	Handler EventHandler
	Group   string
}

type EventBus struct {
	mu            sync.RWMutex
	subscriptions map[string][]Subscription
	recentEvents  []events.Event
	maxRecent     int
	dlqEvents     []events.Event
}

var (
	globalEventBus *EventBus
	eventBusOnce   sync.Once

	// Decoupled metric callbacks to prevent import cycles with middleware
	OnEventPublished       func(topic string)
	OnEventLatencyObserved func(seconds float64)
	OnConsumerFailed       func(topic, group string)
	OnQueueDepthUpdated    func(depth float64)
)

// GetEventBus returns the singleton enterprise EventBus instance.
func GetEventBus() *EventBus {
	eventBusOnce.Do(func() {
		globalEventBus = &EventBus{
			subscriptions: make(map[string][]Subscription),
			recentEvents:  make([]events.Event, 0, 500),
			maxRecent:     500,
			dlqEvents:     make([]events.Event, 0, 100),
		}
	})
	return globalEventBus
}

// Subscribe registers an event handler for a specific topic or wildcard "*".
func (b *EventBus) Subscribe(topic, group string, handler EventHandler) string {
	b.mu.Lock()
	defer b.mu.Unlock()

	subID := events.GenerateUUID()
	sub := Subscription{
		ID:      subID,
		Topic:   topic,
		Handler: handler,
		Group:   group,
	}

	b.subscriptions[topic] = append(b.subscriptions[topic], sub)
	return subID
}

// Publish dispatches an event asynchronously to all subscribed topics/handlers.
func (b *EventBus) Publish(event events.Event) {
	b.mu.Lock()
	if len(b.recentEvents) >= b.maxRecent {
		b.recentEvents = b.recentEvents[1:]
	}
	event.Status = "PROCESSED"
	b.recentEvents = append(b.recentEvents, event)
	depth := float64(len(b.recentEvents))
	b.mu.Unlock()

	if OnEventPublished != nil {
		OnEventPublished(event.Type)
	}
	if OnQueueDepthUpdated != nil {
		OnQueueDepthUpdated(depth)
	}

	go b.dispatch(event)
}

func (b *EventBus) dispatch(event events.Event) {
	b.mu.RLock()
	handlersList := append([]Subscription{}, b.subscriptions[event.Type]...)
	wildcardList := append([]Subscription{}, b.subscriptions["*"]...)
	b.mu.RUnlock()

	allSubs := append(handlersList, wildcardList...)
	if len(allSubs) == 0 {
		return
	}

	for _, sub := range allSubs {
		go func(s Subscription) {
			startTime := time.Now()
			var err error
			maxRetries := 3

			for attempt := 1; attempt <= maxRetries; attempt++ {
				err = s.Handler(event)
				if err == nil {
					if OnEventLatencyObserved != nil {
						OnEventLatencyObserved(time.Since(startTime).Seconds())
					}
					return
				}
				time.Sleep(time.Duration(attempt*50) * time.Millisecond)
			}

			if OnConsumerFailed != nil {
				OnConsumerFailed(s.Topic, s.Group)
			}
			b.routeToDLQ(event)
		}(sub)
	}
}

func (b *EventBus) routeToDLQ(event events.Event) {
	b.mu.Lock()
	defer b.mu.Unlock()
	event.Status = "DLQ"
	if len(b.dlqEvents) >= 100 {
		b.dlqEvents = b.dlqEvents[1:]
	}
	b.dlqEvents = append(b.dlqEvents, event)
}

// GetRecentEvents retrieves recent streaming events for the frontend EventStreamDashboard.
func (b *EventBus) GetRecentEvents(limit int) []events.Event {
	b.mu.RLock()
	defer b.mu.RUnlock()

	if limit <= 0 || limit > len(b.recentEvents) {
		limit = len(b.recentEvents)
	}

	start := len(b.recentEvents) - limit
	result := make([]events.Event, limit)
	copy(result, b.recentEvents[start:])
	return result
}

// GetDLQEvents retrieves failed events in the Dead Letter Queue.
func (b *EventBus) GetDLQEvents() []events.Event {
	b.mu.RLock()
	defer b.mu.RUnlock()

	result := make([]events.Event, len(b.dlqEvents))
	copy(result, b.dlqEvents)
	return result
}
