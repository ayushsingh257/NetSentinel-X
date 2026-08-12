package playbooks

import (
	"time"

	"netsentinel-x-backend/models/events"
	soarmodels "netsentinel-x-backend/models/soar"
)

func NewBruteForcePlaybook() soarmodels.SOARPlaybook {
	return soarmodels.SOARPlaybook{
		ID:                "PB-BRUTE-FORCE-01",
		Name:              "Automated Brute Force Mitigation Playbook",
		Description:       "Autonomously blocks malicious source IPs and requests human approval to lock targeted user account.",
		Category:          "CREDENTIAL_ABUSE",
		TriggerEvent:      "threat.detected",
		SeverityThreshold: "HIGH",
		RiskThreshold:     70.0,
		Enabled:           true,
		CreatedAt:         time.Now().UTC(),
		Steps: []soarmodels.PlaybookStep{
			{
				ID:              "STP-1",
				Name:            "Block Malicious Source IP",
				ActionType:      "BLOCK_IP",
				Target:          "198.51.100.42",
				RequireApproval: false,
				Parameters:      map[string]string{"duration": "24h"},
			},
			{
				ID:              "STP-2",
				Name:            "Disable Compromised Account (Requires Approval)",
				ActionType:      "DISABLE_USER",
				Target:          "user_ayush",
				RequireApproval: true,
				Parameters:      map[string]string{"reason": "Brute Force Threshold Exceeded"},
			},
			{
				ID:              "STP-3",
				Name:            "Create Incident Ticket",
				ActionType:      "CREATE_TICKET",
				Target:          "INC-2026-BRUTE-01",
				RequireApproval: false,
				Parameters:      map[string]string{"priority": "P2"},
			},
		},
	}
}

func GenerateBruteForceExecution(eventID string) soarmodels.SOARExecution {
	now := time.Now().UTC()
	return soarmodels.SOARExecution{
		ExecutionID:  events.GenerateUUID(),
		PlaybookID:   "PB-BRUTE-FORCE-01",
		PlaybookName: "Automated Brute Force Mitigation Playbook",
		EventID:      eventID,
		Status:       "AWAITING_APPROVAL",
		StartedAt:    now,
		Result:       "Step 1 (Block IP) auto-executed. Step 2 (Disable User) pending human approval gate.",
		Logs: []string{
			"[" + now.Format("15:04:05") + "] Playbook PB-BRUTE-FORCE-01 triggered by event " + eventID,
			"[" + now.Format("15:04:05") + "] Auto-executed Action: BLOCK_IP on 198.51.100.42 (Success)",
			"[" + now.Format("15:04:06") + "] Action DISABLE_USER for 'user_ayush' routed to Human Approval Queue",
		},
	}
}
