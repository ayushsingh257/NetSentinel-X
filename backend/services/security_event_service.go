package services

import (
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// SecurityEventCollector manages platform-wide security event collection.
type SecurityEventService struct {
	mu          sync.RWMutex
	auditChain  *AuditChainService
	severitySvc *EventSeverityService
}

// NewSecurityEventService creates a new SecurityEventService instance.
func NewSecurityEventService(auditChain *AuditChainService, severitySvc *EventSeverityService) *SecurityEventService {
	return &SecurityEventService{
		auditChain:  auditChain,
		severitySvc: severitySvc,
	}
}

// CollectEvent normalizes and appends a security event into the hash chain audit log.
func (s *SecurityEventService) CollectEvent(eventType, userID, username, role, ip, device, location, action, resource string) models.SecurityAuditLog {
	s.mu.Lock()
	defer s.mu.Unlock()

	severity := s.severitySvc.ClassifySeverity(eventType)
	return s.auditChain.AppendLog(eventType, severity, userID, username, role, ip, device, location, action, resource, time.Now())
}
