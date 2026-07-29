package handlers

import (
	"net/http"
	"time"

	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

// V2SIEMSecurityHandler handles Era 25 SIEM-Grade Logging REST API endpoints.
type V2SIEMSecurityHandler struct {
	auditChain      *services.AuditChainService
	eventService    *services.SecurityEventService
	threatEngine    *services.ThreatDetectionEngine
	alertService    *services.SecurityAlertService
	timelineService *services.IncidentTimelineService
}

// NewV2SIEMSecurityHandler creates a new V2SIEMSecurityHandler instance.
func NewV2SIEMSecurityHandler(
	auditChain *services.AuditChainService,
	eventService *services.SecurityEventService,
	threatEngine *services.ThreatDetectionEngine,
	alertService *services.SecurityAlertService,
	timelineService *services.IncidentTimelineService,
) *V2SIEMSecurityHandler {
	return &V2SIEMSecurityHandler{
		auditChain:      auditChain,
		eventService:    eventService,
		threatEngine:    threatEngine,
		alertService:    alertService,
		timelineService: timelineService,
	}
}

// GetSIEMPosture returns overall SIEM monitoring health, posture score, and alerts count.
// GET /api/v2/siem/posture
func (h *V2SIEMSecurityHandler) GetSIEMPosture(c *gin.Context) {
	logs := h.auditChain.GetLogs()
	alerts := h.alertService.GetAlerts()
	integrity := h.auditChain.VerifyChainIntegrity()

	openCnt := 0
	critCnt := 0
	for _, a := range alerts {
		if a.Status == models.AlertOpen || a.Status == models.AlertInvestigating {
			openCnt++
		}
		if a.Severity == models.SeverityCritical {
			critCnt++
		}
	}

	posture := models.SIEMPosture{
		Score:               99,
		TotalEventsCount:    len(logs),
		OpenAlertsCount:     openCnt,
		CriticalAlertsCount: critCnt,
		HashChainValid:      integrity.Valid,
		LastVerification:    integrity.LastVerifiedAt,
		Status:              integrity.Status,
	}

	c.JSON(http.StatusOK, gin.H{
		"posture": posture,
		"era":     "25",
		"layer":   "SIEM-Grade Logging & Security Monitoring",
	})
}

// GetEvents returns normalized security audit logs.
// GET /api/v2/siem/events
func (h *V2SIEMSecurityHandler) GetEvents(c *gin.Context) {
	logs := h.auditChain.GetLogs()
	c.JSON(http.StatusOK, gin.H{
		"events": logs,
		"total":  len(logs),
	})
}

// GetAlerts returns correlated SIEM alerts.
// GET /api/v2/siem/alerts
func (h *V2SIEMSecurityHandler) GetAlerts(c *gin.Context) {
	alerts := h.alertService.GetAlerts()
	c.JSON(http.StatusOK, gin.H{
		"alerts": alerts,
		"total":  len(alerts),
	})
}

// GetTimeline returns reconstructed incident attack timeline events.
// GET /api/v2/siem/timeline
func (h *V2SIEMSecurityHandler) GetTimeline(c *gin.Context) {
	timeline := h.timelineService.GetTimeline()
	c.JSON(http.StatusOK, gin.H{
		"timeline": timeline,
		"total":    len(timeline),
	})
}

// GetIntegrity verifies SHA-256 hash chain tamper integrity.
// GET /api/v2/siem/integrity
func (h *V2SIEMSecurityHandler) GetIntegrity(c *gin.Context) {
	result := h.auditChain.VerifyChainIntegrity()
	c.JSON(http.StatusOK, gin.H{
		"integrity": result,
	})
}

// ResolveAlert marks a SIEM threat alert as RESOLVED.
// POST /api/v2/siem/alerts/:id/resolve
func (h *V2SIEMSecurityHandler) ResolveAlert(c *gin.Context) {
	alertID := c.Param("id")
	success := h.alertService.ResolveAlert(alertID)
	if !success {
		c.JSON(http.StatusNotFound, gin.H{"error": "alert_not_found"})
		return
	}

	h.eventService.CollectEvent("ALERT_RESOLVED", "ADMIN", "Admin_User", "SUPER_ADMIN", c.ClientIP(), "Web Console", "Dashboard", "RESOLVE_ALERT", alertID)
	c.JSON(http.StatusOK, gin.H{
		"status":   "RESOLVED",
		"alert_id": alertID,
		"time":     time.Now(),
	})
}
