package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type AuthorizationEvent struct {
	ID                  string    `json:"id"`
	User                string    `json:"user"`
	Role                string    `json:"role"`
	PermissionRequested string    `json:"permission_requested"`
	Resource            string    `json:"resource"`
	Decision            string    `json:"decision"` // ALLOW / DENY
	Timestamp           time.Time `json:"timestamp"`
	Reason              string    `json:"reason"`
}

type AuthorizationService struct {
	mu               sync.RWMutex
	events           []AuthorizationEvent
	auditService     *AuditService
	privilegeMonitor *PrivilegeMonitorService
}

func NewAuthorizationService(audit *AuditService, privMon *PrivilegeMonitorService) *AuthorizationService {
	return &AuthorizationService{
		events:           make([]AuthorizationEvent, 0),
		auditService:     audit,
		privilegeMonitor: privMon,
	}
}

// HasPermission checks if a given Role has the target Permission.
func (a *AuthorizationService) HasPermission(role models.Role, perm models.Permission) bool {
	perms, exists := models.RolePermissionsMap[role]
	if !exists {
		return false
	}
	for _, p := range perms {
		if p == perm {
			return true
		}
	}
	return false
}

// HasPermissionForUser is a string-friendly overload used by middleware.
func (a *AuthorizationService) HasPermissionForUser(roleStr string, permStr string) bool {
	normRole := models.Role(strings.ToUpper(strings.TrimSpace(roleStr)))
	normPerm := models.Permission(strings.ToUpper(strings.TrimSpace(permStr)))

	// Map legacy role aliases if any
	if roleStr == "admin" {
		normRole = models.RoleSuperAdmin
	} else if roleStr == "analyst" {
		normRole = models.RoleSecurityAnalyst
	}

	return a.HasPermission(normRole, normPerm)
}

// EvaluateAccess evaluates permission and records an AuthorizationEvent and AuditLog.
func (a *AuthorizationService) EvaluateAccess(username, roleStr, permStr, resource string) (bool, string) {
	allowed := a.HasPermissionForUser(roleStr, permStr)
	decision := "ALLOW"
	reason := "PERMITTED_BY_ROLE_POLICY"

	if !allowed {
		decision = "DENY"
		reason = "INSUFFICIENT_PRIVILEGES"

		// Notify privilege monitor for suspicious or denied actions
		if a.privilegeMonitor != nil {
			a.privilegeMonitor.DetectAndRecord(username, roleStr, permStr, resource)
		}
	}

	event := AuthorizationEvent{
		ID:                  fmt.Sprintf("AUTHZ-%d", time.Now().UnixNano()%100000),
		User:                username,
		Role:                roleStr,
		PermissionRequested: permStr,
		Resource:            resource,
		Decision:            decision,
		Timestamp:           time.Now(),
		Reason:              reason,
	}

	a.mu.Lock()
	a.events = append([]AuthorizationEvent{event}, a.events...)
	a.mu.Unlock()

	// Audit Logging
	if a.auditService != nil {
		status := "SUCCESS"
		if !allowed {
			status = "DENIED"
		}
		a.auditService.LogEvent(models.AuditLog{
			Timestamp:  time.Now(),
			UserID:     username,
			Username:   username,
			Role:       roleStr,
			Action:     fmt.Sprintf("AUTHORIZATION_%s", decision),
			Category:   "ACCESS_CONTROL",
			Resource:   resource,
			ResourceID: event.ID,
			Severity:   map[bool]string{true: "INFO", false: "WARNING"}[allowed],
			Status:     status,
			Metadata: map[string]interface{}{
				"permission": permStr,
				"decision":   decision,
				"reason":     reason,
			},
		})
	}

	return allowed, reason
}

// GetAuthorizationEvents returns the log of authorization events.
func (a *AuthorizationService) GetAuthorizationEvents(limit int) []AuthorizationEvent {
	a.mu.RLock()
	defer a.mu.RUnlock()

	if limit <= 0 || limit > len(a.events) {
		return a.events
	}
	return a.events[:limit]
}

// GetRoleMatrix returns the complete RBAC matrix mapping roles to their allowed permissions.
func (a *AuthorizationService) GetRoleMatrix() map[string][]string {
	matrix := make(map[string][]string)
	for role, perms := range models.RolePermissionsMap {
		permStrings := make([]string, len(perms))
		for i, p := range perms {
			permStrings[i] = string(p)
		}
		matrix[string(role)] = permStrings
	}
	return matrix
}

// GetUserPermissions returns explicit list of permissions for a user role.
func (a *AuthorizationService) GetUserPermissions(roleStr string) []string {
	normRole := models.Role(strings.ToUpper(strings.TrimSpace(roleStr)))
	if roleStr == "admin" {
		normRole = models.RoleSuperAdmin
	} else if roleStr == "analyst" {
		normRole = models.RoleSecurityAnalyst
	}

	perms, exists := models.RolePermissionsMap[normRole]
	if !exists {
		return []string{}
	}
	result := make([]string, len(perms))
	for i, p := range perms {
		result[i] = string(p)
	}
	return result
}
