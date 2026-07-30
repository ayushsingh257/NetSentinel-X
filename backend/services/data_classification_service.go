package services

import (
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

// DataClassificationService manages automated & manual data classification across resources.
type DataClassificationService struct {
	mu      sync.RWMutex
	records []models.DataClassificationRecord
}

// NewDataClassificationService initializes DataClassificationService with pre-seeded data classifications.
func NewDataClassificationService() *DataClassificationService {
	s := &DataClassificationService{
		records: make([]models.DataClassificationRecord, 0),
	}
	s.seedClassifications()
	return s
}

func (s *DataClassificationService) seedClassifications() {
	now := time.Now()
	s.records = append(s.records,
		models.DataClassificationRecord{
			ID:                   "CLS-1001",
			ResourceID:           "docs/public_api.md",
			ResourceType:         "DOCUMENTATION",
			ClassificationLevel:  "PUBLIC",
			ClassifiedBy:         "AUTOMATIC_ENGINE",
			ClassificationReason: "Public developer API reference document",
			CreatedAt:            now.Add(-30 * 24 * time.Hour),
			UpdatedAt:            now,
		},
		models.DataClassificationRecord{
			ID:                   "CLS-1002",
			ResourceID:           "reports/monthly_metrics.json",
			ResourceType:         "LOG_FILE",
			ClassificationLevel:  "INTERNAL",
			ClassifiedBy:         "AUTOMATIC_ENGINE",
			ClassificationReason: "Internal operational performance summary",
			CreatedAt:            now.Add(-15 * 24 * time.Hour),
			UpdatedAt:            now,
		},
		models.DataClassificationRecord{
			ID:                   "CLS-1003",
			ResourceID:           "db.security_findings",
			ResourceType:         "DATABASE_TABLE",
			ClassificationLevel:  "CONFIDENTIAL",
			ClassifiedBy:         "SECURITY_ADMIN",
			ClassificationReason: "Vulnerability analysis and internal investigation reports",
			CreatedAt:            now.Add(-7 * 24 * time.Hour),
			UpdatedAt:            now,
		},
		models.DataClassificationRecord{
			ID:                   "CLS-1004",
			ResourceID:           "db.user_credentials",
			ResourceType:         "DATABASE_TABLE",
			ClassificationLevel:  "RESTRICTED",
			ClassifiedBy:         "SECURITY_ADMIN",
			ClassificationReason: "Authentication tokens, password hashes, and PII records",
			CreatedAt:            now.Add(-2 * 24 * time.Hour),
			UpdatedAt:            now,
		},
		models.DataClassificationRecord{
			ID:                   "CLS-1005",
			ResourceID:           "db.audit_logs",
			ResourceType:         "DATABASE_TABLE",
			ClassificationLevel:  "RESTRICTED",
			ClassifiedBy:         "SECURITY_ADMIN",
			ClassificationReason: "System audit trails and administrative actions",
			CreatedAt:            now.Add(-1 * 24 * time.Hour),
			UpdatedAt:            now,
		},
	)
}

// ClassifyResource assigns or updates a resource's classification level.
func (s *DataClassificationService) ClassifyResource(resourceID, resourceType, level, classifiedBy, reason string) (*models.DataClassificationRecord, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if level != "PUBLIC" && level != "INTERNAL" && level != "CONFIDENTIAL" && level != "RESTRICTED" {
		return nil, fmt.Errorf("invalid classification level: %s", level)
	}

	now := time.Now()
	// Update if exists
	for i, r := range s.records {
		if r.ResourceID == resourceID {
			s.records[i].ClassificationLevel = level
			s.records[i].ClassifiedBy = classifiedBy
			s.records[i].ClassificationReason = reason
			s.records[i].UpdatedAt = now
			return &s.records[i], nil
		}
	}

	record := models.DataClassificationRecord{
		ID:                   fmt.Sprintf("CLS-%04d", len(s.records)+1001),
		ResourceID:           resourceID,
		ResourceType:         resourceType,
		ClassificationLevel:  level,
		ClassifiedBy:         classifiedBy,
		ClassificationReason: reason,
		CreatedAt:            now,
		UpdatedAt:            now,
	}

	s.records = append(s.records, record)
	return &record, nil
}

// GetClassifiedFields returns recorded classified data fields (backwards compatibility with Era 23).
func (s *DataClassificationService) GetClassifiedFields() []models.DataClassificationRecord {
	s.mu.RLock()
	defer s.mu.RUnlock()

	recordsCopy := make([]models.DataClassificationRecord, len(s.records))
	copy(recordsCopy, s.records)
	return recordsCopy
}

// MaskValue masks values based on classification level (backwards compatibility with Era 23).
func (s *DataClassificationService) MaskValue(level, value string) string {
	if level == "RESTRICTED" || level == "CONFIDENTIAL" {
		return "********"
	}
	return value
}

// GetStats calculates distribution counts per classification level.
func (s *DataClassificationService) GetStats() *models.DataClassificationStatsResponse {
	s.mu.RLock()
	defer s.mu.RUnlock()

	pub, intl, conf, rest := 0, 0, 0, 0
	for _, r := range s.records {
		switch r.ClassificationLevel {
		case "PUBLIC":
			pub++
		case "INTERNAL":
			intl++
		case "CONFIDENTIAL":
			conf++
		case "RESTRICTED":
			rest++
		}
	}

	recordsCopy := make([]models.DataClassificationRecord, len(s.records))
	copy(recordsCopy, s.records)

	return &models.DataClassificationStatsResponse{
		PublicCount:       pub,
		InternalCount:     intl,
		ConfidentialCount: conf,
		RestrictedCount:   rest,
		TotalResources:    len(s.records),
		Records:           recordsCopy,
	}
}
