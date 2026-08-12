package playbooks

import (
	"time"

	soarmodels "netsentinel-x-backend/models/soar"
)

func NewCriticalAlertPlaybook() soarmodels.SOARPlaybook {
	return soarmodels.SOARPlaybook{
		ID:                "PB-CRITICAL-ALERT-01",
		Name:              "Critical Security Incident Escalation & Response",
		Description:       "Escalates incident priority, creates security ticket, and notifies tier-2 SOC team.",
		Category:          "INCIDENT_RESPONSE",
		TriggerEvent:      "ai.analysis.completed",
		SeverityThreshold: "CRITICAL",
		RiskThreshold:     90.0,
		Enabled:           true,
		CreatedAt:         time.Now().UTC(),
		Steps: []soarmodels.PlaybookStep{
			{
				ID:              "STP-1",
				Name:            "Escalate Incident Priority",
				ActionType:      "ESCALATE_SEVERITY",
				Target:          "INC-2026-CRITICAL",
				RequireApproval: false,
				Parameters:      map[string]string{"new_priority": "P1_CRITICAL"},
			},
			{
				ID:              "STP-2",
				Name:            "Create P1 Security Ticket",
				ActionType:      "CREATE_TICKET",
				Target:          "INC-2026-CRITICAL",
				RequireApproval: false,
				Parameters:      map[string]string{"sla": "15m"},
			},
		},
	}
}
