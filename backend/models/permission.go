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
	PermViewDashboard       Permission = "VIEW_DASHBOARD"
	PermViewReports         Permission = "VIEW_REPORTS"
)

var RolePermissionsMap = map[Role][]Permission{
	RoleSuperAdmin: {
		PermViewIncidents, PermCreateIncidents, PermCloseIncidents,
		PermRunThreatHunts, PermCreateRules, PermModifyRules,
		PermExecutePlaybooks, PermExportReports, PermViewAuditLogs,
		PermSystemConfiguration, PermViewDashboard, PermViewReports,
	},
	RoleSOCAdmin: {
		PermViewIncidents, PermCreateIncidents, PermCloseIncidents,
		PermRunThreatHunts, PermCreateRules, PermModifyRules,
		PermExecutePlaybooks, PermExportReports, PermViewAuditLogs,
		PermViewDashboard, PermViewReports,
	},
	RoleSecurityAnalyst: {
		PermViewIncidents, PermCreateIncidents, PermCloseIncidents,
		PermRunThreatHunts, PermExecutePlaybooks, PermExportReports,
		PermViewDashboard, PermViewReports,
	},
	RoleThreatHunter: {
		PermViewIncidents, PermRunThreatHunts, PermExportReports,
		PermViewDashboard, PermViewReports,
	},
	RoleDetectionEngineer: {
		PermViewIncidents, PermCreateRules, PermModifyRules, PermExportReports,
		PermViewDashboard, PermViewReports,
	},
	RoleAuditor: {
		PermViewIncidents, PermExportReports, PermViewAuditLogs,
		PermViewDashboard, PermViewReports,
	},
	RoleViewOnly: {
		PermViewIncidents, PermViewReports, PermViewDashboard,
	},
}
