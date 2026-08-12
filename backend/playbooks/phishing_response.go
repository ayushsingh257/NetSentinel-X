package playbooks

import (
	"time"

	soarmodels "netsentinel-x-backend/models/soar"
)

func NewPhishingPlaybook() soarmodels.SOARPlaybook {
	return soarmodels.SOARPlaybook{
		ID:                "PB-PHISHING-01",
		Name:              "Phishing Domain & Credential Protection",
		Description:       "Blocks malicious URL domain and revokes OAuth consent grants.",
		Category:          "PHISHING",
		TriggerEvent:      "alerts.created",
		SeverityThreshold: "MEDIUM",
		RiskThreshold:     60.0,
		Enabled:           true,
		CreatedAt:         time.Now().UTC(),
		Steps: []soarmodels.PlaybookStep{
			{
				ID:              "STP-1",
				Name:            "Block Phishing URL Domain",
				ActionType:      "BLOCK_IP",
				Target:          "malicious-phish-domain.com",
				RequireApproval: false,
				Parameters:      map[string]string{"dns_sinkhole": "TRUE"},
			},
		},
	}
}
