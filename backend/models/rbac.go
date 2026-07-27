package models

type Role string

const (
	RoleSuperAdmin        Role = "SUPER_ADMIN"
	RoleSOCAdmin          Role = "SOC_ADMIN"
	RoleSecurityAnalyst   Role = "SECURITY_ANALYST"
	RoleThreatHunter      Role = "THREAT_HUNTER"
	RoleDetectionEngineer Role = "DETECTION_ENGINEER"
	RoleAuditor           Role = "AUDITOR"
	RoleViewOnly          Role = "VIEW_ONLY"
)

type UserRoleAssignment struct {
	UserID      string   `json:"user_id"`
	Username    string   `json:"username"`
	Role        Role     `json:"role"`
	Permissions []string `json:"permissions"`
}
