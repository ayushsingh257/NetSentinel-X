package services

import (
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// DataRetentionService manages data retention policies, expiration detection, and secure deletion workflows.
type DataRetentionService struct {
	mu       sync.RWMutex
	policies []models.RetentionPolicy
}

// NewDataRetentionService initializes DataRetentionService with pre-seeded enterprise retention policies.
func NewDataRetentionService() *DataRetentionService {
	s := &DataRetentionService{
		policies: make([]models.RetentionPolicy, 0),
	}
	s.seedPolicies()
	return s
}

func (s *DataRetentionService) seedPolicies() {
	now := time.Now()
	s.policies = append(s.policies,
		models.RetentionPolicy{
			ID:                "POL-RET-001",
			DataType:          "SECURITY_LOGS",
			RetentionPeriod:   365,
			ActionAfterExpiry: "PURGE",
			CreatedAt:         now.Add(-180 * 24 * time.Hour),
		},
		models.RetentionPolicy{
			ID:                "POL-RET-002",
			DataType:          "AUDIT_LOGS",
			RetentionPeriod:   730,
			ActionAfterExpiry: "ARCHIVE",
			CreatedAt:         now.Add(-180 * 24 * time.Hour),
		},
		models.RetentionPolicy{
			ID:                "POL-RET-003",
			DataType:          "TEMP_DATA",
			RetentionPeriod:   30,
			ActionAfterExpiry: "PURGE",
			CreatedAt:         now.Add(-15 * 24 * time.Hour),
		},
	)
}

// GetPolicies returns all active retention policies.
func (s *DataRetentionService) GetPolicies() []models.RetentionPolicy {
	s.mu.RLock()
	defer s.mu.RUnlock()

	policiesCopy := make([]models.RetentionPolicy, len(s.policies))
	copy(policiesCopy, s.policies)
	return policiesCopy
}

// CheckExpirations checks if any data records exceed their retention period and triggers expiration workflows.
func (s *DataRetentionService) CheckExpirations(dataType string, recordAgeDays int) (string, bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, pol := range s.policies {
		if pol.DataType == dataType {
			if recordAgeDays > pol.RetentionPeriod {
				return "DATA_EXPIRATION_TRIGGERED", true, nil
			}
			return "DATA_WITHIN_RETENTION", false, nil
		}
	}
	return "UNKNOWN_POLICY", false, fmt.Errorf("no retention policy found for data type: %s", dataType)
}

// ExecutePurge simulates secure deletion workflow for expired data records.
func (s *DataRetentionService) ExecutePurge(dataType string) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Returns count of purged expired records
	return 142, nil
}
