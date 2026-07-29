package services

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

const GenesisHash = "GENESIS_ROOT_HASH_00000000000000000000000000000000"

// AuditChainService manages immutable audit log append operations and SHA-256 hash chain verification.
type AuditChainService struct {
	mu       sync.RWMutex
	logs     []models.SecurityAuditLog
	lastHash string
}

// NewAuditChainService creates a new AuditChainService instance.
func NewAuditChainService() *AuditChainService {
	s := &AuditChainService{
		logs:     make([]models.SecurityAuditLog, 0),
		lastHash: GenesisHash,
	}
	s.seedAuditChain()
	return s
}

func (s *AuditChainService) computeHash(prevHash, eventType, userID, username, action, resource string, timestamp time.Time) string {
	payload := fmt.Sprintf("%s|%s|%s|%s|%s|%s|%d", prevHash, eventType, userID, username, action, resource, timestamp.UnixNano())
	h := sha256.Sum256([]byte(payload))
	return hex.EncodeToString(h[:])
}

func (s *AuditChainService) seedAuditChain() {
	now := time.Now()

	s.AppendLog("LOGIN_SUCCESS", models.SeverityInfo, "USR-001", "Ayush", "SUPER_ADMIN", "103.21.124.50", "Windows PC", "Delhi", "AUTHENTICATE", "Dashboard", now.Add(-1*time.Hour))
	s.AppendLog("API_KEY_CREATED", models.SeverityInfo, "USR-001", "Ayush", "SUPER_ADMIN", "103.21.124.50", "Windows PC", "Delhi", "CREATE", "api_keys/nsx_live_9012", now.Add(-45*time.Minute))
	s.AppendLog("DATA_READ", models.SeverityInfo, "USR-002", "Sarah_SOC", "SOC_ADMIN", "49.207.180.12", "MacBook Pro", "Mumbai", "SELECT", "incidents", now.Add(-30*time.Minute))
	s.AppendLog("PRIVILEGE_ESCALATION", models.SeverityCritical, "USR-003", "Analyst_Bob", "SECURITY_ANALYST", "185.220.101.5", "Linux Workstation", "Frankfurt", "UNAUTHORIZED_ADMIN_EXEC", "/api/v2/admin/system", now.Add(-15*time.Minute))
}

// AppendLog appends a new entry to the immutable cryptographic audit chain.
func (s *AuditChainService) AppendLog(eventType string, severity models.EventSeverity, userID, username, role, ip, device, location, action, resource string, ts time.Time) models.SecurityAuditLog {
	s.mu.Lock()
	defer s.mu.Unlock()

	logID := fmt.Sprintf("AUD-%d", len(s.logs)+1001)
	currHash := s.computeHash(s.lastHash, eventType, userID, username, action, resource, ts)

	entry := models.SecurityAuditLog{
		ID:           logID,
		EventType:    eventType,
		Severity:     severity,
		UserID:       userID,
		Username:     username,
		Role:         role,
		IPAddress:    ip,
		Device:       device,
		Location:     location,
		Action:       action,
		Resource:     resource,
		Timestamp:    ts,
		PreviousHash: s.lastHash,
		CurrentHash:  currHash,
	}

	s.logs = append(s.logs, entry)
	s.lastHash = currHash
	return entry
}

// ChainIntegrityResult contains audit chain verification details.
type ChainIntegrityResult struct {
	Valid          bool      `json:"valid"`
	Status         string    `json:"status"` // "CHAIN_VALID" or "TAMPERING_DETECTED"
	TotalLogs      int       `json:"total_logs"`
	TamperedIndex  int       `json:"tampered_index"`
	TamperedLogID  string    `json:"tampered_log_id,omitempty"`
	LastVerifiedAt time.Time `json:"last_verified_at"`
}

// VerifyChainIntegrity verifies the entire hash chain from index 0 to N.
func (s *AuditChainService) VerifyChainIntegrity() ChainIntegrityResult {
	s.mu.RLock()
	defer s.mu.RUnlock()

	expectedPrev := GenesisHash
	for i, entry := range s.logs {
		if entry.PreviousHash != expectedPrev {
			return ChainIntegrityResult{
				Valid:          false,
				Status:         "TAMPERING_DETECTED",
				TotalLogs:      len(s.logs),
				TamperedIndex:  i,
				TamperedLogID:  entry.ID,
				LastVerifiedAt: time.Now(),
			}
		}

		recalcHash := s.computeHash(entry.PreviousHash, entry.EventType, entry.UserID, entry.Username, entry.Action, entry.Resource, entry.Timestamp)
		if entry.CurrentHash != recalcHash {
			return ChainIntegrityResult{
				Valid:          false,
				Status:         "TAMPERING_DETECTED",
				TotalLogs:      len(s.logs),
				TamperedIndex:  i,
				TamperedLogID:  entry.ID,
				LastVerifiedAt: time.Now(),
			}
		}

		expectedPrev = entry.CurrentHash
	}

	return ChainIntegrityResult{
		Valid:          true,
		Status:         "CHAIN_VALID",
		TotalLogs:      len(s.logs),
		TamperedIndex:  -1,
		LastVerifiedAt: time.Now(),
	}
}

// InjectTamperingForTest simulates illegal log modification for test verification.
func (s *AuditChainService) InjectTamperingForTest(index int) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if index >= 0 && index < len(s.logs) {
		s.logs[index].Username = "TAMPERED_ATTACKER"
		return true
	}
	return false
}

// GetLogs returns all audit log entries.
func (s *AuditChainService) GetLogs() []models.SecurityAuditLog {
	s.mu.RLock()
	defer s.mu.RUnlock()

	res := make([]models.SecurityAuditLog, len(s.logs))
	copy(res, s.logs)
	return res
}
