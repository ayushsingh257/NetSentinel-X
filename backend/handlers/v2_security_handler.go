package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2SecurityHandler struct {
	securityService *services.SecurityAuditService
}

func NewV2SecurityHandler() *V2SecurityHandler {
	return &V2SecurityHandler{
		securityService: services.NewSecurityAuditService(),
	}
}

type RevokeSessionReq struct {
	SessionID string `json:"session_id"`
}

func (h *V2SecurityHandler) GetPosture(c *gin.Context) {
	posture := h.securityService.GetPosture()
	c.JSON(http.StatusOK, posture)
}

func (h *V2SecurityHandler) GetRBAC(c *gin.Context) {
	rbac := h.securityService.GetRBAC()
	c.JSON(http.StatusOK, gin.H{
		"assignments": rbac,
		"total":       len(rbac),
	})
}

func (h *V2SecurityHandler) GetActiveSessions(c *gin.Context) {
	sessions := h.securityService.GetActiveSessions()
	c.JSON(http.StatusOK, gin.H{
		"sessions": sessions,
		"total":    len(sessions),
	})
}

func (h *V2SecurityHandler) RevokeSession(c *gin.Context) {
	var req RevokeSessionReq
	if err := c.ShouldBindJSON(&req); err != nil || req.SessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "SessionID required"})
		return
	}
	success := h.securityService.RevokeSession(req.SessionID)
	if !success {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "REVOKED", "session_id": req.SessionID})
}

func (h *V2SecurityHandler) GetEvents(c *gin.Context) {
	events := h.securityService.GetSecurityEvents()
	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"total":  len(events),
	})
}
