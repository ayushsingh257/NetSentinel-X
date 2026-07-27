package services

import (
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type SecurityAuditService struct {
	mu        sync.RWMutex
	sessions  map[string]models.ActiveSession
	events    []models.SecurityEvent
	userRoles []models.UserRoleAssignment
}

func NewSecurityAuditService() *SecurityAuditService {
	s := &SecurityAuditService{
		sessions:  make(map[string]models.ActiveSession),
		events:    make([]models.SecurityEvent, 0),
		userRoles: make([]models.UserRoleAssignment, 0),
	}
	s.seedSecurityData()
	return s
}

func (s *SecurityAuditService) seedSecurityData() {
	now := time.Now()

	s.userRoles = []models.UserRoleAssignment{
		{UserID: "USR-001", Username: "Ayush (Lead Analyst)", Role: models.RoleSuperAdmin, Permissions: []string{"ALL_PERMISSIONS"}},
		{UserID: "USR-002", Username: "SOC Analyst", Role: models.RoleSecurityAnalyst, Permissions: []string{"VIEW_INCIDENTS", "CREATE_INCIDENTS", "RUN_THREAT_HUNTS"}},
		{UserID: "USR-003", Username: "Security Engineer", Role: models.RoleDetectionEngineer, Permissions: []string{"CREATE_RULES", "MODIFY_RULES"}},
		{UserID: "USR-004", Username: "Compliance Auditor", Role: models.RoleAuditor, Permissions: []string{"VIEW_AUDIT_LOGS", "EXPORT_REPORTS"}},
	}

	s.sessions = map[string]models.ActiveSession{
		"SES-1001": {
			SessionID:  "SES-1001",
			UserID:     "USR-001",
			Username:   "Ayush (Lead Analyst)",
			Role:       models.RoleSuperAdmin,
			IPAddress:  "192.168.1.10",
			UserAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			DeviceInfo: "Chrome 126 / Windows 11",
			LoginTime:  now.Add(-2 * time.Hour),
			LastSeen:   now.Add(-1 * time.Minute),
			IsActive:   true,
		},
		"SES-1002": {
			SessionID:  "SES-1002",
			UserID:     "USR-002",
			Username:   "SOC Analyst",
			Role:       models.RoleSecurityAnalyst,
			IPAddress:  "192.168.1.15",
			UserAgent:  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
			DeviceInfo: "Safari 17 / macOS Sonoma",
			LoginTime:  now.Add(-1 * time.Hour),
			LastSeen:   now.Add(-5 * time.Minute),
			IsActive:   true,
		},
	}

	s.events = []models.SecurityEvent{
		{
			ID:          "SECEVT-901",
			EventType:   "FAILED_LOGIN",
			Severity:    "MEDIUM",
			Source:      "Authentication Layer",
			Description: "Failed password attempt for user 'admin' from IP 185.220.101.45",
			IPAddress:   "185.220.101.45",
			Timestamp:   now.Add(-25 * time.Minute),
		},
		{
			ID:          "SECEVT-902",
			EventType:   "PRIVILEGE_CHANGE",
			Severity:    "HIGH",
			Source:      "RBAC Engine",
			Description: "Role upgraded for USR-001 to SUPER_ADMIN by system administrator",
			IPAddress:   "192.168.1.10",
			Timestamp:   now.Add(-15 * time.Minute),
		},
		{
			ID:          "SECEVT-903",
			EventType:   "BLOCKED_REQUEST",
			Severity:    "LOW",
			Source:      "Rate Limiter Middleware",
			Description: "Rate limit triggered (105 req/min) for IP 192.168.1.105",
			IPAddress:   "192.168.1.105",
			Timestamp:   now.Add(-5 * time.Minute),
		},
	}
}

func (s *SecurityAuditService) GetPosture() models.SecurityPosture {
	s.mu.RLock()
	defer s.mu.RUnlock()

	activeCount := 0
	for _, sess := range s.sessions {
		if sess.IsActive {
			activeCount++
		}
	}

	return models.SecurityPosture{
		SecurityScore:        96,
		AuthenticationStatus: "HEALTHY",
		APIProtectionStatus:  "HEALTHY",
		SecretsStatus:        "HEALTHY",
		DependenciesStatus:   "HEALTHY",
		ContainerStatus:      "WARNING",
		ActiveSessionsCount:  activeCount,
		RecentSecurityEvents: s.events,
		CheckedAt:            time.Now(),
	}
}

func (s *SecurityAuditService) GetRBAC() []models.UserRoleAssignment {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.userRoles
}

func (s *SecurityAuditService) GetActiveSessions() []models.ActiveSession {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.ActiveSession
	for _, sess := range s.sessions {
		if sess.IsActive {
			result = append(result, sess)
		}
	}
	return result
}

func (s *SecurityAuditService) RevokeSession(sessionID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	sess, exists := s.sessions[sessionID]
	if !exists {
		return false
	}

	sess.IsActive = false
	s.sessions[sessionID] = sess
	return true
}

func (s *SecurityAuditService) GetSecurityEvents() []models.SecurityEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.events
}
