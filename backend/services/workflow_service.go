package services

import (
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type WorkflowService struct {
	mu         sync.RWMutex
	workflows  map[string]models.Workflow
	executions []models.WorkflowExecution
	approvals  []models.WorkflowApproval
	templates  []models.WorkflowTemplate
}

func NewWorkflowService() *WorkflowService {
	s := &WorkflowService{
		workflows:  make(map[string]models.Workflow),
		executions: make([]models.WorkflowExecution, 0),
		approvals:  make([]models.WorkflowApproval, 0),
		templates:  make([]models.WorkflowTemplate, 0),
	}
	s.seedWorkflowData()
	return s
}

func (s *WorkflowService) seedWorkflowData() {
	now := time.Now()

	wf1 := models.Workflow{
		ID:          "WF-001",
		Name:        "Automated C2 Beaconing Isolation Playbook",
		Description: "Autonomously detects C2 beaconing activity, enriches IOC reputation, requests approval, and isolates compromised host.",
		Category:    "C2_BEACONING",
		Status:      "ACTIVE",
		Trigger: models.WorkflowTrigger{
			ID:        "TRG-001",
			Type:      "DETECTION_RULE",
			Source:    "RULE-SIGMA-001",
			Condition: "Risk Score >= 85",
		},
		Steps: []models.WorkflowStep{
			{ID: "STP-1", Name: "Triage Alert & Enrich Threat Intel", ActionType: "NOTIFY_TEAM", Parameters: map[string]string{"channel": "#soc-alerts", "severity": "HIGH"}, Status: "COMPLETED", ExecutedAt: now.Add(-30 * time.Minute)},
			{ID: "STP-2", Name: "Create Automated Incident Case", ActionType: "CREATE_INCIDENT", Parameters: map[string]string{"title": "C2 Beaconing Detected", "priority": "P1"}, Status: "COMPLETED", ExecutedAt: now.Add(-29 * time.Minute)},
			{ID: "STP-3", Name: "Simulate Host Endpoint Isolation", ActionType: "ISOLATE_HOST", Parameters: map[string]string{"host_ip": "192.168.1.105", "mode": "SIMULATED"}, Status: "COMPLETED", ExecutedAt: now.Add(-28 * time.Minute)},
		},
		CreatedBy: "SOC Lead Analyst",
		CreatedAt: now.Add(-72 * time.Hour),
		UpdatedAt: now.Add(-2 * time.Hour),
	}

	wf2 := models.Workflow{
		ID:          "WF-002",
		Name:        "Ransomware & Lateral Movement Containment",
		Description: "Triggers on high-severity UEBA anomaly detection to immediately block egress traffic and notify incident responders.",
		Category:    "RANSOMWARE",
		Status:      "ACTIVE",
		Trigger: models.WorkflowTrigger{
			ID:        "TRG-002",
			Type:      "UEBA_ANOMALY",
			Source:    "Anomaly Engine",
			Condition: "Sigma Deviation > 3.0",
		},
		Steps: []models.WorkflowStep{
			{ID: "STP-1", Name: "Block Malicious C2 IP Address", ActionType: "BLOCK_IOC", Parameters: map[string]string{"ioc": "185.220.101.45", "action": "SIMULATED_FIREWALL_BLOCK"}, Status: "COMPLETED", ExecutedAt: now.Add(-15 * time.Minute)},
			{ID: "STP-2", Name: "Trigger AI Threat Hunting Sweep", ActionType: "RUN_HUNT", Parameters: map[string]string{"query": "dns tunneling"}, Status: "COMPLETED", ExecutedAt: now.Add(-14 * time.Minute)},
		},
		CreatedBy: "Detection Engineer",
		CreatedAt: now.Add(-48 * time.Hour),
		UpdatedAt: now.Add(-1 * time.Hour),
	}

	s.workflows[wf1.ID] = wf1
	s.workflows[wf2.ID] = wf2

	s.executions = []models.WorkflowExecution{
		{
			ID:           "EXEC-2026-001",
			WorkflowID:   "WF-001",
			WorkflowName: "Automated C2 Beaconing Isolation Playbook",
			TriggerEvent: "Sigma Rule RULE-SIGMA-001 Triggered on 192.168.1.105",
			Status:       "COMPLETED",
			Steps:        wf1.Steps,
			CurrentStep:  3,
			StartedAt:    now.Add(-30 * time.Minute),
			CompletedAt:  now.Add(-28 * time.Minute),
			Logs: []string{
				"[00:00] Workflow EXEC-2026-001 triggered by RULE-SIGMA-001",
				"[00:01] Step 1: Team notified via #soc-alerts",
				"[00:02] Step 2: Incident INC-2026-8001 created",
				"[00:03] Step 3: Host 192.168.1.105 isolation simulated successfully",
			},
		},
	}

	s.approvals = []models.WorkflowApproval{
		{
			ID:           "APP-101",
			ExecutionID:  "EXEC-2026-002",
			WorkflowName: "Ransomware & Lateral Movement Containment",
			StepName:     "Isolate Production DB Host",
			Action:       "SIMULATED_HOST_ISOLATION",
			Requester:    "Autonomous Playbook Engine",
			Status:       "PENDING",
			RequestedAt:  now.Add(-10 * time.Minute),
		},
	}

	s.templates = []models.WorkflowTemplate{
		{
			ID:          "TPL-01",
			Name:        "Malware Outbreak Response Playbook",
			Description: "Quarantines host, retrieves forensic memory dump, and blocks associated hash IOCs.",
			Category:    "MALWARE",
			Severity:    "CRITICAL",
			Trigger:     models.WorkflowTrigger{Type: "DETECTION_RULE", Source: "YARA / Sigma"},
			Steps: []models.WorkflowStep{
				{Name: "Notify SOC Responder", ActionType: "NOTIFY_TEAM"},
				{Name: "Simulate Host Quarantine", ActionType: "ISOLATE_HOST"},
				{Name: "Block Hash IOC", ActionType: "BLOCK_IOC"},
			},
		},
		{
			ID:          "TPL-02",
			Name:        "Credential Dumping Mitigation Playbook",
			Description: "Revokes user active session tokens and forces password reset workflow.",
			Category:    "CREDENTIAL_THEFT",
			Severity:    "HIGH",
			Trigger:     models.WorkflowTrigger{Type: "UEBA_ANOMALY", Source: "LSASS Access Pattern"},
			Steps: []models.WorkflowStep{
				{Name: "Assign Tier-2 Analyst", ActionType: "ASSIGN_ANALYST"},
				{Name: "Request Admin Approval", ActionType: "REQUEST_APPROVAL"},
			},
		},
	}
}

func (s *WorkflowService) GetWorkflows() []models.Workflow {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Workflow
	for _, wf := range s.workflows {
		result = append(result, wf)
	}
	return result
}

func (s *WorkflowService) GetWorkflowByID(id string) (models.Workflow, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	wf, exists := s.workflows[id]
	return wf, exists
}

func (s *WorkflowService) CreateWorkflow(wf models.Workflow) models.Workflow {
	s.mu.Lock()
	defer s.mu.Unlock()

	if wf.ID == "" {
		wf.ID = fmt.Sprintf("WF-%03d", len(s.workflows)+1)
	}
	wf.CreatedAt = time.Now()
	wf.UpdatedAt = time.Now()
	if wf.Status == "" {
		wf.Status = "ACTIVE"
	}
	s.workflows[wf.ID] = wf
	return wf
}

func (s *WorkflowService) ExecuteWorkflow(id string) (models.WorkflowExecution, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	wf, exists := s.workflows[id]
	if !exists {
		return models.WorkflowExecution{}, fmt.Errorf("workflow %s not found", id)
	}

	execID := fmt.Sprintf("EXEC-2026-%03d", len(s.executions)+1)
	now := time.Now()

	exec := models.WorkflowExecution{
		ID:           execID,
		WorkflowID:   wf.ID,
		WorkflowName: wf.Name,
		TriggerEvent: fmt.Sprintf("Manual / Automated Execution of %s", wf.Name),
		Status:       "COMPLETED",
		Steps:        wf.Steps,
		CurrentStep:  len(wf.Steps),
		StartedAt:    now,
		CompletedAt:  now.Add(2 * time.Second),
		Logs: []string{
			fmt.Sprintf("[%s] Workflow %s started", now.Format("15:04:05"), execID),
			fmt.Sprintf("[%s] Executed %d playbook steps successfully", now.Format("15:04:05"), len(wf.Steps)),
		},
	}

	s.executions = append([]models.WorkflowExecution{exec}, s.executions...)
	return exec, nil
}

func (s *WorkflowService) GetExecutionHistory() []models.WorkflowExecution {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.executions
}

func (s *WorkflowService) GetExecutionByID(id string) (models.WorkflowExecution, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, e := range s.executions {
		if e.ID == id {
			return e, true
		}
	}
	return models.WorkflowExecution{}, false
}

func (s *WorkflowService) GetApprovals() []models.WorkflowApproval {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.approvals
}

func (s *WorkflowService) DecideApproval(id string, approved bool) (models.WorkflowApproval, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, app := range s.approvals {
		if app.ID == id {
			if approved {
				s.approvals[i].Status = "APPROVED"
			} else {
				s.approvals[i].Status = "REJECTED"
			}
			s.approvals[i].DecidedAt = time.Now()
			return s.approvals[i], true
		}
	}
	return models.WorkflowApproval{}, false
}

func (s *WorkflowService) GetTemplates() []models.WorkflowTemplate {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.templates
}

func (s *WorkflowService) GenerateAIPlaybook(category string) models.Workflow {
	s.mu.RLock()
	defer s.mu.RUnlock()

	now := time.Now()
	return models.Workflow{
		ID:          fmt.Sprintf("AI-PLAYBOOK-%03d", len(s.workflows)+100),
		Name:        fmt.Sprintf("Autonomous AI Playbook — %s Response", category),
		Description: fmt.Sprintf("AI-generated orchestration playbook tailored for %s threat scenario based on NetSentinel-X intelligence correlation.", category),
		Category:    category,
		Status:      "DRAFT",
		Trigger: models.WorkflowTrigger{
			ID:        "AI-TRG",
			Type:      "DETECTION_RULE",
			Source:    "AI Threat Investigation Engine",
			Condition: "Risk Score >= 80",
		},
		Steps: []models.WorkflowStep{
			{ID: "S1", Name: "Triage Alert & Enrich Threat Intel", ActionType: "NOTIFY_TEAM", Parameters: map[string]string{"channel": "#soc-alerts"}},
			{ID: "S2", Name: "Create Automated Incident Case", ActionType: "CREATE_INCIDENT", Parameters: map[string]string{"priority": "P1"}},
			{ID: "S3", Name: "Simulate Host Endpoint Isolation", ActionType: "ISOLATE_HOST", Parameters: map[string]string{"mode": "SIMULATED"}},
		},
		CreatedBy: "AI Autonomous Playbook Generator",
		CreatedAt: now,
		UpdatedAt: now,
	}
}
