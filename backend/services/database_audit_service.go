package services

import (
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// DatabaseAuditService records and queries database operation audit trails.
type DatabaseAuditService struct {
	mu   sync.RWMutex
	logs []models.DatabaseQueryAuditLog
}

// NewDatabaseAuditService initializes DatabaseAuditService with seeded query logs.
func NewDatabaseAuditService() *DatabaseAuditService {
	s := &DatabaseAuditService{
		logs: make([]models.DatabaseQueryAuditLog, 0),
	}
	s.seedAuditLogs()
	return s
}

func (s *DatabaseAuditService) seedAuditLogs() {
	now := time.Now()

	s.logs = append(s.logs,
		models.DatabaseQueryAuditLog{
			ID:        "DBAUD-1001",
			User:      "application_user",
			Action:    "UPDATE",
			Table:     "incidents",
			Timestamp: now.Add(-15 * time.Minute),
			IP:        "172.20.0.5",
			Result:    "SUCCESS",
			Query:     "UPDATE incidents SET status='RESOLVED' WHERE id='INC-9012'",
		},
		models.DatabaseQueryAuditLog{
			ID:        "DBAUD-1002",
			User:      "application_user",
			Action:    "INSERT",
			Table:     "threat_events",
			Timestamp: now.Add(-30 * time.Minute),
			IP:        "172.20.0.5",
			Result:    "SUCCESS",
			Query:     "INSERT INTO threat_events (event_id, severity) VALUES ($1, $2)",
		},
		models.DatabaseQueryAuditLog{
			ID:        "DBAUD-1003",
			User:      "readonly_audit_user",
			Action:    "SELECT",
			Table:     "audit_logs",
			Timestamp: now.Add(-45 * time.Minute),
			IP:        "172.20.0.12",
			Result:    "SUCCESS",
			Query:     "SELECT * FROM audit_logs WHERE timestamp >= $1 LIMIT 100",
		},
		models.DatabaseQueryAuditLog{
			ID:        "DBAUD-1004",
			User:      "application_user",
			Action:    "DROP",
			Table:     "users",
			Timestamp: now.Add(-2 * time.Hour),
			IP:        "192.168.1.100",
			Result:    "BLOCKED",
			Query:     "DROP TABLE users; -- Privilege Denial Check",
		},
		models.DatabaseQueryAuditLog{
			ID:        "DBAUD-1005",
			User:      "migration_user",
			Action:    "ALTER",
			Table:     "api_keys",
			Timestamp: now.Add(-24 * time.Hour),
			IP:        "172.20.0.2",
			Result:    "SUCCESS",
			Query:     "ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS status VARCHAR(32)",
		},
	)
}

// LogQuery adds a new query execution record to the audit trail.
func (s *DatabaseAuditService) LogQuery(user, action, table, ip, result, querySnippet string) models.DatabaseQueryAuditLog {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry := models.DatabaseQueryAuditLog{
		ID:        "DBAUD-" + time.Now().Format("150405"),
		User:      user,
		Action:    action,
		Table:     table,
		Timestamp: time.Now(),
		IP:        ip,
		Result:    result,
		Query:     querySnippet,
	}

	s.logs = append([]models.DatabaseQueryAuditLog{entry}, s.logs...)
	if len(s.logs) > 500 {
		s.logs = s.logs[:500]
	}
	return entry
}

// GetAuditLogs returns the query audit history.
func (s *DatabaseAuditService) GetAuditLogs() []models.DatabaseQueryAuditLog {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.DatabaseQueryAuditLog, len(s.logs))
	copy(result, s.logs)
	return result
}
