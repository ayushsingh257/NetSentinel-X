package handlers

import (
	"net/http"
	"strconv"

	"netsentinel-x-backend/services"
	"netsentinel-x-backend/workers"

	"github.com/gin-gonic/gin"
)

type V2EventBusHandler struct {
	publisher   *services.EventPublisherService
	bus         *services.EventBus
	persistence *services.EventPersistenceService
	wm          *workers.WorkerManager
}

func NewV2EventBusHandler() *V2EventBusHandler {
	return &V2EventBusHandler{
		publisher:   services.NewEventPublisherService(),
		bus:         services.GetEventBus(),
		persistence: services.GetEventPersistenceService(),
		wm:          workers.GetWorkerManager(),
	}
}

// GetStream handles GET /api/v2/events/stream
func (h *V2EventBusHandler) GetStream(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "100")
	limit, _ := strconv.Atoi(limitStr)
	eventsList := h.bus.GetRecentEvents(limit)
	c.JSON(http.StatusOK, gin.H{
		"events": eventsList,
		"total":  len(eventsList),
	})
}

// GetHistory handles GET /api/v2/events/history
func (h *V2EventBusHandler) GetHistory(c *gin.Context) {
	eventType := c.Query("type")
	severity := c.Query("severity")
	limitStr := c.DefaultQuery("limit", "50")
	limit, _ := strconv.Atoi(limitStr)

	records := h.persistence.GetEventHistory(eventType, severity, limit)
	c.JSON(http.StatusOK, gin.H{
		"records": records,
		"total":   len(records),
	})
}

// GetWorkerStatus handles GET /api/v2/events/workers/status
func (h *V2EventBusHandler) GetWorkerStatus(c *gin.Context) {
	statuses := h.wm.GetWorkerStatuses()
	c.JSON(http.StatusOK, gin.H{
		"workers": statuses,
		"total":   len(statuses),
	})
}

// GetDLQ handles GET /api/v2/events/dlq
func (h *V2EventBusHandler) GetDLQ(c *gin.Context) {
	dlq := h.bus.GetDLQEvents()
	c.JSON(http.StatusOK, gin.H{
		"dlq_events": dlq,
		"total":      len(dlq),
	})
}
