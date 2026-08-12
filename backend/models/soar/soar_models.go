package soar

import (
	"time"
)

type PlaybookStep struct {
	ID              string            `json:"id"`
	Name            string            `json:"name"`
	ActionType      string            `json:"action_type"` // e.g. "BLOCK_IP", "DISABLE_USER", "ISOLATE_HOST", "CREATE_TICKET"
	Target          string            `json:"target"`
	RequireApproval bool              `json:"require_approval"`
	Parameters      map[string]string `json:"parameters"`
}

type SOARPlaybook struct {
	ID                string         `json:"id"`
	Name              string         `json:"name"`
	Description       string         `json:"description"`
	Category          string         `json:"category"`
	TriggerEvent      string         `json:"trigger_event"`      // e.g. "threat.detected", "alerts.created", "ai.analysis.completed"
	SeverityThreshold string         `json:"severity_threshold"` // "LOW", "MEDIUM", "HIGH", "CRITICAL"
	RiskThreshold     float64        `json:"risk_threshold"`     // 0.0 to 100.0
	Enabled           bool           `json:"enabled"`
	Steps             []PlaybookStep `json:"steps"`
	CreatedAt         time.Time      `json:"created_at"`
}

type SOARExecution struct {
	ExecutionID  string    `json:"execution_id"`
	PlaybookID   string    `json:"playbook_id"`
	PlaybookName string    `json:"playbook_name"`
	EventID      string    `json:"event_id"`
	Status       string    `json:"status"` // "RUNNING", "COMPLETED", "FAILED", "AWAITING_APPROVAL"
	StartedAt    time.Time `json:"started_at"`
	CompletedAt  time.Time `json:"completed_at,omitempty"`
	Result       string    `json:"result"`
	Logs         []string  `json:"logs"`
}

type SOARActionLog struct {
	ActionID       string            `json:"action_id"`
	ExecutionID    string            `json:"execution_id"`
	ActionType     string            `json:"action_type"`
	Target         string            `json:"target"`
	ApprovalStatus string            `json:"approval_status"` // "AUTO_APPROVED", "APPROVED", "REJECTED", "PENDING"
	ExecutedBy     string            `json:"executed_by"`     // "SOAR_ENGINE" or user name
	Timestamp      time.Time         `json:"timestamp"`
	Details        map[string]string `json:"details"`
}

type SOARApprovalRequest struct {
	ID           string    `json:"id"`
	ExecutionID  string    `json:"execution_id"`
	PlaybookName string    `json:"playbook_name"`
	ActionType   string    `json:"action_type"`
	Target       string    `json:"target"`
	RiskLevel    string    `json:"risk_level"` // "HIGH", "CRITICAL"
	RequestedAt  time.Time `json:"requested_at"`
	Status       string    `json:"status"` // "PENDING", "APPROVED", "REJECTED"
	DecidedBy    string    `json:"decided_by,omitempty"`
	DecidedAt    time.Time `json:"decided_at,omitempty"`
}
