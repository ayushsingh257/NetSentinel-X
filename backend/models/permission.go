package models

type Permission string

const (
	PermViewIncidents       Permission = "VIEW_INCIDENTS"
	PermCreateIncidents     Permission = "CREATE_INCIDENTS"
	PermCloseIncidents      Permission = "CLOSE_INCIDENTS"
	PermRunThreatHunts      Permission = "RUN_THREAT_HUNTS"
	PermCreateRules         Permission = "CREATE_RULES"
	PermModifyRules         Permission = "MODIFY_RULES"
	PermExecutePlaybooks    Permission = "EXECUTE_PLAYBOOKS"
	PermExportReports       Permission = "EXPORT_REPORTS"
	PermViewAuditLogs       Permission = "VIEW_AUDIT_LOGS"
	PermSystemConfiguration Permission = "SYSTEM_CONFIGURATION"
)

var RolePermissionsMap = map[Role][]Permission{
	RoleSuperAdmin: {
		PermViewIncidents, PermCreateIncidents, PermCloseIncidents,
		PermRunThreatHunts, PermCreateRules, PermModifyRules,
		PermExecutePlaybooks, PermExportReports, PermViewAuditLogs,
		PermSystemConfiguration,
	},
	RoleSOCAdmin: {
		PermViewIncidents, PermCreateIncidents, PermCloseIncidents,
		PermRunThreatHunts, PermCreateRules, PermModifyRules,
		PermExecutePlaybooks, PermExportReports, PermViewAuditLogs,
	},
	RoleSecurityAnalyst: {
		PermViewIncidents, PermCreateIncidents, PermCloseIncidents,
		PermRunThreatHunts, PermExecutePlaybooks, PermExportReports,
	},
	RoleThreatHunter: {
		PermViewIncidents, PermRunThreatHunts, PermExportReports,
	},
	RoleDetectionEngineer: {
		PermViewIncidents, PermCreateRules, PermModifyRules, PermExportReports,
	},
	RoleAuditor: {
		PermViewIncidents, PermExportReports, PermViewAuditLogs,
	},
	RoleViewOnly: {
		PermViewIncidents,
	},
}
