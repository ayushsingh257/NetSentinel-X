package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type PrivilegeViolation struct {
	ID          string    `json:"id"`
	Username    string    `json:"username"`
	Role        string    `json:"role"`
	Action      string    `json:"action"`
	Resource    string    `json:"resource"`
	Severity    string    `json:"severity"`
	Timestamp   time.Time `json:"timestamp"`
	Description string    `json:"description"`
}

type PrivilegeMonitorService struct {
	mu            sync.RWMutex
	violations    []PrivilegeViolation
	securityAudit *SecurityAuditService
	auditService  *AuditService
}

func NewPrivilegeMonitorService(secAudit *SecurityAuditService, audit *AuditService) *PrivilegeMonitorService {
	return &PrivilegeMonitorService{
		violations:    make([]PrivilegeViolation, 0),
		securityAudit: secAudit,
		auditService:  audit,
	}
}

// DetectAndRecord Violation analyzes access attempts for privilege escalation or illegal actions.
func (p *PrivilegeMonitorService) DetectAndRecord(username, role, requestedPermission, resource string) *PrivilegeViolation {
	p.mu.Lock()
	defer p.mu.Unlock()

	normRole := strings.ToUpper(strings.TrimSpace(role))
	normPerm := strings.ToUpper(strings.TrimSpace(requestedPermission))

	var violationType string
	var severity string
	var description string

	// Scenario 1: Non-admin user attempting SYSTEM_CONFIGURATION
	if normPerm == "SYSTEM_CONFIGURATION" && normRole != "SUPER_ADMIN" {
		violationType = "CRITICAL_SYSTEM_CONFIG_ATTEMPT"
		severity = "HIGH"
		description = fmt.Sprintf("Unauthorized user '%s' (%s) attempted SYSTEM_CONFIGURATION on resource '%s'", username, role, resource)
	}

	// Scenario 2: View-only user attempting state-mutating actions (CREATE, DELETE, EXPORT, EXECUTE, MODIFY)
	if normRole == string(models.RoleViewOnly) &&
		(strings.HasPrefix(normPerm, "CREATE_") || strings.HasPrefix(normPerm, "MODIFY_") ||
			strings.HasPrefix(normPerm, "DELETE_") || strings.HasPrefix(normPerm, "CLOSE_") ||
			strings.HasPrefix(normPerm, "EXECUTE_") || strings.HasPrefix(normPerm, "RUN_") ||
			strings.HasPrefix(normPerm, "EXPORT_")) {
		violationType = "VIEW_ONLY_MUTATION_ATTEMPT"
		severity = "MEDIUM"
		description = fmt.Sprintf("View-only user '%s' attempted restricted mutation action '%s' on resource '%s'", username, requestedPermission, resource)
	}

	// Scenario 3: Role escalation / manipulation attempt
	if strings.Contains(normPerm, "ESCALATE") || strings.Contains(normPerm, "ADMIN_OVERRIDE") {
		violationType = "ROLE_MANIPULATION_ATTEMPT"
		severity = "CRITICAL"
		description = fmt.Sprintf("Critical role escalation attempt detected by user '%s' (%s) attempting '%s'", username, role, requestedPermission)
	}

	if violationType == "" {
		// Generic unauthorized access violation
		violationType = "UNAUTHORIZED_ACCESS_ATTEMPT"
		severity = "MEDIUM"
		description = fmt.Sprintf("User '%s' with role '%s' denied permission '%s' on resource '%s'", username, role, requestedPermission, resource)
	}

	viol := PrivilegeViolation{
		ID:          fmt.Sprintf("VIOL-%d", time.Now().UnixNano()%100000),
		Username:    username,
		Role:        role,
		Action:      requestedPermission,
		Resource:    resource,
		Severity:    severity,
		Timestamp:   time.Now(),
		Description: description,
	}

	p.violations = append([]PrivilegeViolation{viol}, p.violations...)

	// Log event to AuditService
	if p.auditService != nil {
		p.auditService.LogEvent(models.AuditLog{
			Timestamp:  time.Now(),
			UserID:     username,
			Username:   username,
			Role:       role,
			Action:     fmt.Sprintf("PERMISSION_DENIED_%s", normPerm),
			Category:   "AUTHORIZATION",
			Resource:   resource,
			ResourceID: viol.ID,
			Severity:   severity,
			Status:     "DENIED",
			Metadata: map[string]interface{}{
				"permission_requested": requestedPermission,
				"reason":               "INSUFFICIENT_PRIVILEGES",
				"violation_type":       violationType,
			},
		})
	}

	return &viol
}

func (p *PrivilegeMonitorService) GetViolations() []PrivilegeViolation {
	p.mu.RLock()
	defer p.mu.RUnlock()
	return p.violations
}
