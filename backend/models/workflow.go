package models

import "time"

type WorkflowTrigger struct {
	ID        string `json:"id"`
	Type      string `json:"type"` // "INCIDENT_CREATED", "DETECTION_RULE", "UEBA_ANOMALY", "MANUAL", "SCHEDULED"
	Source    string `json:"source"`
	Condition string `json:"condition"`
}

type WorkflowStep struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	ActionType string            `json:"action_type"` // "CREATE_INCIDENT", "ASSIGN_ANALYST", "NOTIFY_TEAM", "BLOCK_IOC", "ISOLATE_HOST", "RUN_HUNT", "REQUEST_APPROVAL"
	Parameters map[string]string `json:"parameters"`
	Status     string            `json:"status"` // "PENDING", "RUNNING", "COMPLETED", "FAILED", "SKIPPED", "AWAITING_APPROVAL"
	ExecutedAt time.Time         `json:"executed_at,omitempty"`
	ErrorMsg   string            `json:"error_msg,omitempty"`
}

type Workflow struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Category    string          `json:"category"` // "MALWARE", "RANSOMWARE", "C2_BEACONING", "CREDENTIAL_THEFT", "DNS_TUNNELING"
	Status      string          `json:"status"`   // "ACTIVE", "INACTIVE", "DRAFT"
	Trigger     WorkflowTrigger `json:"trigger"`
	Steps       []WorkflowStep  `json:"steps"`
	CreatedBy   string          `json:"created_by"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

type WorkflowExecution struct {
	ID           string         `json:"id"`
	WorkflowID   string         `json:"workflow_id"`
	WorkflowName string         `json:"workflow_name"`
	TriggerEvent string         `json:"trigger_event"`
	Status       string         `json:"status"` // "RUNNING", "COMPLETED", "FAILED", "AWAITING_APPROVAL", "CANCELLED"
	Steps        []WorkflowStep `json:"steps"`
	CurrentStep  int            `json:"current_step"`
	StartedAt    time.Time      `json:"started_at"`
	CompletedAt  time.Time      `json:"completed_at,omitempty"`
	Logs         []string       `json:"logs"`
}

type WorkflowApproval struct {
	ID           string    `json:"id"`
	ExecutionID  string    `json:"execution_id"`
	WorkflowName string    `json:"workflow_name"`
	StepName     string    `json:"step_name"`
	Action       string    `json:"action"`
	Requester    string    `json:"requester"`
	Status       string    `json:"status"` // "PENDING", "APPROVED", "REJECTED"
	RequestedAt  time.Time `json:"requested_at"`
	DecidedAt    time.Time `json:"decided_at,omitempty"`
}

type WorkflowTemplate struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Category    string          `json:"category"`
	Severity    string          `json:"severity"`
	Trigger     WorkflowTrigger `json:"trigger"`
	Steps       []WorkflowStep  `json:"steps"`
}
