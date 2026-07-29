package handlers

import (
	"net/http"
	"time"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

// V2IdentitySecurityHandler handles Era 24 Secure Session & Advanced Identity REST API endpoints.
type V2IdentitySecurityHandler struct {
	tokenService        *services.TokenService
	refreshTokenService *services.RefreshTokenService
	sessionService      *services.SessionSecurityService
	mfaService          *services.MFAService
	riskService         *services.LoginRiskService
	authEventService    *services.AuthEventService
}

// NewV2IdentitySecurityHandler creates a new V2IdentitySecurityHandler instance.
func NewV2IdentitySecurityHandler(
	tokenService *services.TokenService,
	refreshTokenService *services.RefreshTokenService,
	sessionService *services.SessionSecurityService,
	mfaService *services.MFAService,
	riskService *services.LoginRiskService,
	authEventService *services.AuthEventService,
) *V2IdentitySecurityHandler {
	return &V2IdentitySecurityHandler{
		tokenService:        tokenService,
		refreshTokenService: refreshTokenService,
		sessionService:      sessionService,
		mfaService:          mfaService,
		riskService:         riskService,
		authEventService:    authEventService,
	}
}

// GetIdentityPosture returns identity security posture, MFA coverage, active sessions count, and score.
// GET /api/v2/identity/posture
func (h *V2IdentitySecurityHandler) GetIdentityPosture(c *gin.Context) {
	sessions := h.sessionService.GetActiveSessions()
	mfaRecords := h.mfaService.GetMFARecords()

	c.JSON(http.StatusOK, gin.H{
		"identity_score":      98,
		"mfa_coverage":        "100%",
		"active_sessions_cnt": len(sessions),
		"privileged_mfa":      "STRICT_ENFORCED",
		"access_token_ttl":    "15m",
		"refresh_token_ttl":   "30d",
		"mfa_records":         mfaRecords,
		"era":                 "24",
		"layer":               "Secure Session & Advanced Identity",
	})
}

// GetSessions returns all active user sessions.
// GET /api/v2/identity/sessions
func (h *V2IdentitySecurityHandler) GetSessions(c *gin.Context) {
	sessions := h.sessionService.GetActiveSessions()
	c.JSON(http.StatusOK, gin.H{
		"sessions": sessions,
		"total":    len(sessions),
	})
}

// RevokeSession revokes a single session.
// POST /api/v2/identity/session/revoke
func (h *V2IdentitySecurityHandler) RevokeSession(c *gin.Context) {
	var body struct {
		SessionID string `json:"session_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "session_id_required"})
		return
	}

	err := h.sessionService.RevokeSession(body.SessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	h.authEventService.LogEvent("SESSION_REVOKED", "ADMIN", "Admin_User", c.ClientIP(), "Web Console", "Dashboard", "Single session revoked: "+body.SessionID, 10)
	c.JSON(http.StatusOK, gin.H{"status": "SESSION_REVOKED", "session_id": body.SessionID})
}

// RevokeAllUserSessions revokes all sessions for a user.
// POST /api/v2/identity/session/revoke-all
func (h *V2IdentitySecurityHandler) RevokeAllUserSessions(c *gin.Context) {
	var body struct {
		UserID string `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id_required"})
		return
	}

	count := h.sessionService.RevokeAllUserSessions(body.UserID)
	h.refreshTokenService.RevokeUserTokens(body.UserID)

	h.authEventService.LogEvent("ALL_SESSIONS_REVOKED", body.UserID, body.UserID, c.ClientIP(), "Web Console", "Dashboard", "Global user session revocation executed", 20)
	c.JSON(http.StatusOK, gin.H{"status": "ALL_SESSIONS_REVOKED", "user_id": body.UserID, "revoked_count": count})
}

// SetupMFA configures TOTP MFA for a user.
// POST /api/v2/identity/mfa/setup
func (h *V2IdentitySecurityHandler) SetupMFA(c *gin.Context) {
	var body struct {
		UserID string `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id_required"})
		return
	}

	secret, codes, err := h.mfaService.SetupMFA(body.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id":        body.UserID,
		"secret":         secret,
		"qr_uri":         "otpauth://totp/NetSentinel-X:" + body.UserID + "?secret=" + secret + "&issuer=NetSentinel-X",
		"recovery_codes": codes,
	})
}

// VerifyMFA verifies a TOTP 6-digit code or recovery code.
// POST /api/v2/identity/mfa/verify
func (h *V2IdentitySecurityHandler) VerifyMFA(c *gin.Context) {
	var body struct {
		UserID   string `json:"user_id" binding:"required"`
		Passcode string `json:"passcode" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id_and_passcode_required"})
		return
	}

	valid, err := h.mfaService.VerifyPasscode(body.UserID, body.Passcode)
	if !valid || err != nil {
		h.authEventService.LogEvent("MFA_FAILURE", body.UserID, body.UserID, c.ClientIP(), "Web Console", "Dashboard", "Invalid MFA passcode verification attempt", 40)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_mfa_passcode"})
		return
	}

	h.authEventService.LogEvent("MFA_SUCCESS", body.UserID, body.UserID, c.ClientIP(), "Web Console", "Dashboard", "MFA TOTP passcode verified", 0)
	c.JSON(http.StatusOK, gin.H{"status": "MFA_VERIFIED", "user_id": body.UserID})
}

// RefreshToken executes 30-day single-use refresh token rotation.
// POST /api/v2/identity/refresh
func (h *V2IdentitySecurityHandler) RefreshToken(c *gin.Context) {
	var body struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "refresh_token_required"})
		return
	}

	newRefresh, userID, sessionID, err := h.refreshTokenService.RotateRefreshToken(body.RefreshToken)
	if err != nil {
		if err == services.ErrTokenReuseDetected {
			// CRITICAL: Token reuse attack detected! Revoke all sessions!
			h.sessionService.RevokeAllUserSessions(userID)
			h.refreshTokenService.RevokeUserTokens(userID)
			h.authEventService.LogEvent("SUSPICIOUS_LOGIN", userID, userID, c.ClientIP(), "Unknown", "Unknown", "Token reuse attack detected! All user sessions revoked.", 100)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "TOKEN_REUSE_DETECTED", "action": "ALL_SESSIONS_REVOKED"})
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_or_expired_refresh_token"})
		return
	}

	// Issue NEW 15-minute access token
	newAccess, expiry, err := h.tokenService.GenerateAccessToken(userID, userID, "SOC_ADMIN", sessionID, []string{"all"})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token_generation_failed"})
		return
	}

	h.authEventService.LogEvent("TOKEN_REFRESH", userID, userID, c.ClientIP(), "Web Console", "Dashboard", "15m access token renewed via rotating refresh token", 5)

	c.JSON(http.StatusOK, gin.H{
		"access_token":  newAccess,
		"expires_at":    expiry,
		"refresh_token": newRefresh,
		"token_type":    "Bearer",
	})
}

// GetEvents returns identity authentication audit log events.
// GET /api/v2/identity/events
func (h *V2IdentitySecurityHandler) GetEvents(c *gin.Context) {
	events := h.authEventService.GetAuthEvents()
	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"total":  len(events),
	})
}

// EvaluateRisk calculates login risk score for request parameters.
// GET /api/v2/identity/risk
func (h *V2IdentitySecurityHandler) EvaluateRisk(c *gin.Context) {
	userID := c.DefaultQuery("user_id", "USR-001")
	device := c.DefaultQuery("device", "Windows 11 PC")
	location := c.DefaultQuery("location", "New Delhi, India")
	ip := c.ClientIP()

	risk := h.riskService.AssessLoginRisk(userID, ip, device, location, time.Now())
	c.JSON(http.StatusOK, gin.H{
		"assessment": risk,
	})
}
