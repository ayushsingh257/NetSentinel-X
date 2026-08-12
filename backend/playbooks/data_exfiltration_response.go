package playbooks

import (
	"time"

	soarmodels "netsentinel-x-backend/models/soar"
)

func NewDataExfiltrationPlaybook() soarmodels.SOARPlaybook {
	return soarmodels.SOARPlaybook{
		ID:                "PB-EXFILTRATION-01",
		Name:              "Data Exfiltration & DLP Egress Blocking",
		Description:       "Blocks egress IP address and revokes compromise active user sessions.",
		Category:          "DATA_EXFILTRATION",
		TriggerEvent:      "threat.detected",
		SeverityThreshold: "HIGH",
		RiskThreshold:     75.0,
		Enabled:           true,
		CreatedAt:         time.Now().UTC(),
		Steps: []soarmodels.PlaybookStep{
			{
				ID:              "STP-1",
				Name:            "Block Egress Destination IP",
				ActionType:      "BLOCK_IP",
				Target:          "198.51.100.99",
				RequireApproval: false,
				Parameters:      map[string]string{"direction": "OUTBOUND"},
			},
			{
				ID:              "STP-2",
				Name:            "Revoke Active User Sessions",
				ActionType:      "REVOKE_SESSIONS",
				Target:          "exfil_user",
				RequireApproval: false,
				Parameters:      map[string]string{"scope": "ALL_TOKENS"},
			},
		},
	}
}
