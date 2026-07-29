package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2AuthorizationHandler struct {
	authzService    *services.AuthorizationService
	privMonitor     *services.PrivilegeMonitorService
	secAuditService *services.SecurityAuditService
}

func NewV2AuthorizationHandler(
	authz *services.AuthorizationService,
	privMon *services.PrivilegeMonitorService,
	secAudit *services.SecurityAuditService,
) *V2AuthorizationHandler {
	return &V2AuthorizationHandler{
		authzService:    authz,
		privMonitor:     privMon,
		secAuditService: secAudit,
	}
}

type PermissionCheckRequest struct {
	Permission string `json:"permission" binding:"required"`
	Resource   string `json:"resource"`
}

// GetMyPermissions returns current user permissions and role details.
// Route: GET /api/v2/authz/me
func (h *V2AuthorizationHandler) GetMyPermissions(c *gin.Context) {
	usernameVal, _ := c.Get("username")
	roleVal, _ := c.Get("role")

	username, _ := usernameVal.(string)
	role, _ := roleVal.(string)

	if username == "" {
		username = "ANONYMOUS"
	}
	if role == "" {
		role = "VIEW_ONLY"
	}

	perms := h.authzService.GetUserPermissions(role)

	c.JSON(http.StatusOK, gin.H{
		"user":        username,
		"role":        role,
		"permissions": perms,
	})
}

// CheckPermission performs an explicit on-demand permission check.
// Route: POST /api/v2/authz/check
func (h *V2AuthorizationHandler) CheckPermission(c *gin.Context) {
	var req PermissionCheckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Permission parameter is required",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	usernameVal, _ := c.Get("username")
	roleVal, _ := c.Get("role")

	username, _ := usernameVal.(string)
	role, _ := roleVal.(string)

	resource := req.Resource
	if resource == "" {
		resource = "DirectPermissionCheck"
	}

	allowed, reason := h.authzService.EvaluateAccess(username, role, req.Permission, resource)

	c.JSON(http.StatusOK, gin.H{
		"permission": req.Permission,
		"allowed":    allowed,
		"reason":     reason,
	})
}

// GetRoleMatrix returns the full RBAC mapping of all platform roles to permissions.
// Route: GET /api/v2/authz/roles
func (h *V2AuthorizationHandler) GetRoleMatrix(c *gin.Context) {
	matrix := h.authzService.GetRoleMatrix()
	c.JSON(http.StatusOK, gin.H{
		"matrix": matrix,
	})
}

// GetViolations returns security violations and privilege escalation attempts.
// Route: GET /api/v2/authz/violations
func (h *V2AuthorizationHandler) GetViolations(c *gin.Context) {
	if h.privMonitor == nil {
		c.JSON(http.StatusOK, gin.H{"violations": []interface{}{}})
		return
	}
	violations := h.privMonitor.GetViolations()
	c.JSON(http.StatusOK, gin.H{
		"violations": violations,
	})
}

// GetAuthzEvents returns recent authorization decision events.
// Route: GET /api/v2/authz/events
func (h *V2AuthorizationHandler) GetAuthzEvents(c *gin.Context) {
	events := h.authzService.GetAuthorizationEvents(50)
	c.JSON(http.StatusOK, gin.H{
		"events": events,
	})
}
