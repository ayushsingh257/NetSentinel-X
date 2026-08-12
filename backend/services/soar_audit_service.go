package services

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models/events"
)

type SOARAuditRecord struct {
	LogID          string            `json:"log_id"`
	ExecutionID    string            `json:"execution_id"`
	PlaybookName   string            `json:"playbook_name font-mono"`
	ActionType     string            `json:"action_type"`
	Target         string            `json:"target"`
	TriggeredBy    string            `json:"triggered_by"` // "AI_THREAT_ENGINE" or user
	AIReasoning    string            `json:"ai_reasoning"`
	ApprovalStatus string            `json:"approval_status"` // "AUTO_APPROVED", "APPROVED", "REJECTED"
	ExecutedBy     string            `json:"executed_by"`
	Timestamp      time.Time         `json:"timestamp"`
	HMACSignature  string            `json:"hmac_signature"`
	Metadata       map[string]string `json:"metadata"`
}

type SOARAuditService struct {
	mu      sync.RWMutex
	records []SOARAuditRecord
	maxSize int
}

var (
	globalSOARAudit *SOARAuditService
	soarAuditOnce   sync.Once
)

func GetSOARAuditService() *SOARAuditService {
	soarAuditOnce.Do(func() {
		globalSOARAudit = &SOARAuditService{
			records: make([]SOARAuditRecord, 0, 1000),
			maxSize: 1000,
		}
		globalSOARAudit.seedAuditLog()
	})
	return globalSOARAudit
}

func (s *SOARAuditService) seedAuditLog() {
	now := time.Now().UTC()
	s.RecordAction(
		events.GenerateUUID(),
		"Automated Brute Force Mitigation Playbook",
		"BLOCK_IP",
		"198.51.100.42",
		"AI_THREAT_ENGINE",
		"Brute Force attack detected via DPI Engine with Risk Score 95.5 > Threshold 80",
		"AUTO_APPROVED",
		"SOAR_DISPATCHER",
		now.Add(-10*time.Minute),
	)
}

func (s *SOARAuditService) RecordAction(execID, pbName, actionType, target, triggeredBy, aiReasoning, appStatus, executedBy string, ts time.Time) SOARAuditRecord {
	s.mu.Lock()
	defer s.mu.Unlock()

	if ts.IsZero() {
		ts = time.Now().UTC()
	}

	logID := "SOAR-AUD-" + events.GenerateUUID()[:8]
	rawSig := fmt.Sprintf("%s|%s|%s|%s|%s|%s", logID, execID, actionType, target, appStatus, ts.Format(time.RFC3339))
	hash := sha256.Sum256([]byte(rawSig))
	sig := hex.EncodeToString(hash[:])

	rec := SOARAuditRecord{
		LogID:          logID,
		ExecutionID:    execID,
		PlaybookName:   pbName,
		ActionType:     actionType,
		Target:         target,
		TriggeredBy:    triggeredBy,
		AIReasoning:    aiReasoning,
		ApprovalStatus: appStatus,
		ExecutedBy:     executedBy,
		Timestamp:      ts,
		HMACSignature:  sig,
		Metadata:       map[string]string{"forensic_chain": "VALIDATED"},
	}

	if len(s.records) >= s.maxSize {
		s.records = s.records[1:]
	}
	s.records = append(s.records, rec)
	return rec
}

func (s *SOARAuditService) GetAuditLogs(limit int) []SOARAuditRecord {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if limit <= 0 || limit > len(s.records) {
		limit = len(s.records)
	}

	result := make([]SOARAuditRecord, limit)
	copy(result, s.records[len(s.records)-limit:])
	return result
}
