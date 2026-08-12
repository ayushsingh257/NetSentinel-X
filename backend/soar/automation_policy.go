package soar

import "strings"

type AutomationPolicy struct {
	AutoApprovalRiskMax float64
}

func NewAutomationPolicy() *AutomationPolicy {
	return &AutomationPolicy{
		AutoApprovalRiskMax: 80.0,
	}
}

// RequiresApproval evaluates whether an action step requires human approval.
func (p *AutomationPolicy) RequiresApproval(actionType string, riskScore float64, stepRequireApproval bool) bool {
	if stepRequireApproval {
		return true
	}
	act := strings.ToUpper(actionType)
	if act == "DISABLE_USER" || act == "DELETE_ENTITY" {
		return true
	}
	if riskScore > p.AutoApprovalRiskMax && (act == "ISOLATE_HOST" || act == "REVOKE_SESSIONS") {
		return true
	}
	return false
}
