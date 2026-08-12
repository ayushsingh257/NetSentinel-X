package routes

import (
	"netsentinel-x-backend/handlers"
	"netsentinel-x-backend/middleware"
	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"
	"netsentinel-x-backend/websocket"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	// Apply Global Security Headers & Request Security Middleware to all requests
	router.Use(middleware.SecurityHeadersMiddleware())
	router.Use(middleware.RequestSecurityMiddleware())
	router.Use(middleware.ValidateQueryParams())
	router.Use(middleware.ValidateHeaders())

	// Initialize security & authorization services
	auditService := services.NewAuditService()
	secAuditService := services.NewSecurityAuditService()
	privMonitorService := services.NewPrivilegeMonitorService(secAuditService, auditService)
	authzService := services.NewAuthorizationService(auditService, privMonitorService)
	middleware.SetGlobalAuthorizationService(authzService)

	valService := services.NewInputValidationService()
	xssService := services.NewXSSProtectionService()
	fileSecService := services.NewFileSecurityService()

	apiKeyService := services.NewAPIKeyService()
	middleware.SetGlobalAPIKeyService(apiKeyService)

	oauthService := services.NewOAuthService()
	adaptiveRateService := services.NewAdaptiveRateService(auditService)
	middleware.SetGlobalAdaptiveRateService(adaptiveRateService)

	webhookService := services.NewWebhookSecurityService()
	apiAbuseEngine := services.NewAPIAbuseDetectionEngine(secAuditService, auditService)
	intraService := services.NewInfrastructureSecurityService(auditService)
	secretsService := services.NewSecretsManagementService(auditService)
	cryptoService := services.NewCryptographicSecurityService()
	leakService := services.NewSecretDetectionService()
	envService := services.NewEnvironmentSecurityService()
	dbSecurityService := services.NewDatabaseSecurityService(auditService)
	dataEncryptService := services.NewDataEncryptionService()
	dataClassService := services.NewDataClassificationService()
	dbAuditService := services.NewDatabaseAuditService()
	sqlSecurityService := services.NewSQLSecurityService()
	backupService := services.NewBackupSecurityService()
	tokenService := services.NewTokenService()
	refreshTokenService := services.NewRefreshTokenService(auditService)
	sessionSecService := services.NewSessionSecurityService()
	mfaService := services.NewMFAService()
	loginRiskService := services.NewLoginRiskService()
	authEventService := services.NewAuthEventService()
	auditChainService := services.NewAuditChainService()
	severityService := services.NewEventSeverityService()
	securityEventService := services.NewSecurityEventService(auditChainService, severityService)
	securityAlertService := services.NewSecurityAlertService()
	threatEngine := services.NewThreatDetectionEngine(auditChainService, securityAlertService)
	timelineService := services.NewIncidentTimelineService(auditChainService)
	cicdSecurityService := services.NewCICDSecurityService()
	readinessService := services.NewProductionReadinessService()
	deploymentHealthService := services.NewDeploymentHealthService()
	drBackupService := services.NewBackupService()
	drRestoreService := services.NewRestoreVerificationService(drBackupService)
	privacyClassService := services.NewDataClassificationService()
	privacyPIIService := services.NewPIIDetectionService()
	privacyMaskService := services.NewDataMaskingService()
	privacyRetService := services.NewDataRetentionService()
	secAuditCheckService := services.NewSecurityAuditService()
	secVulnService := services.NewVulnerabilityAssessmentService()
	secOwaspService := services.NewOWASPValidationService()
	secSimService := services.NewSecuritySimulationService()
	secScoreService := services.NewSecurityScoreService()
	secAuditReportService := services.NewSecurityAuditReportService()
	aiAnalystService := services.NewAISecurityAnalystService(nil)
	advancedDetectionService := services.NewAdvancedDetectionService()
	threatIntelFusionService := services.NewThreatIntelFusionEngineService()
	enterpriseIntegrationsService := services.NewEnterpriseIntegrationsService()

	router.Use(middleware.AdaptiveRateLimitMiddleware())

	// ─── Public Routes (no authentication required) ────────────────────────────
	router.GET("/", handlers.HomeHandler)
	router.GET("/health", handlers.HealthHandler)
	router.GET("/liveness", handlers.LivenessHandler)
	router.GET("/healthz", handlers.LivenessHandler)
	router.GET("/readiness", handlers.ReadinessHandler)
	router.GET("/analytics", handlers.GetAnalytics)
	router.POST("/login", handlers.LoginHandler)
	router.POST("/logout", handlers.LogoutHandler)
	router.GET("/metrics", middleware.PrometheusHandler())
	router.GET("/traffic", handlers.GetTrafficLogs)
	router.GET("/alerts", handlers.GetAlerts)
	router.GET("/export/traffic", handlers.ExportTrafficReport)
	router.GET("/ws", websocket.HandleWebSocket)

	// ─── Legacy V1 Admin Routes (auth-protected) ───────────────────────────────
	adminRoutes := router.Group("/")
	adminRoutes.Use(
		middleware.AuthMiddleware(),
		middleware.AdminOnly(),
	)
	{
		adminRoutes.POST("/traffic", handlers.CreateTrafficLog)
	}

	// ─── Auth Session Routes (all require valid JWT) ────────────────────────────
	v2AuthHandler := handlers.NewV2AuthHandler()
	authGroup := router.Group("/api/auth")
	authGroup.Use(middleware.AuthMiddleware())
	{
		authGroup.GET("/me", v2AuthHandler.GetMe)
		authGroup.GET("/session/validate", v2AuthHandler.ValidateSession)
		authGroup.POST("/refresh", v2AuthHandler.RefreshToken)
		authGroup.POST("/logout", v2AuthHandler.Logout)
	}

	// ─── NetSentinel-X V2 Enterprise API (all require valid JWT) ───────────────
	v2CopilotHandler := handlers.NewV2CopilotHandler()
	v2InvestigationHandler := handlers.NewV2InvestigationHandler()
	v2MITREHandler := handlers.NewV2MITREHandler()
	v2DetectionHandler := handlers.NewV2DetectionHandler()
	v2IntelligenceHandler := handlers.NewV2IntelligenceHandler()
	v2UEBAHandler := handlers.NewV2UEBAHandler()
	v2OptimizerHandler := handlers.NewV2OptimizerHandler()
	v2IncidentHandler := handlers.NewV2IncidentHandler()
	v2ReportHandler := handlers.NewV2ReportHandler()
	v2AttackGraphHandler := handlers.NewV2AttackGraphHandler()
	v2HistoricalHandler := handlers.NewV2HistoricalHandler()
	v2WorkflowHandler := handlers.NewV2WorkflowHandler()
	v2ObservabilityHandler := handlers.NewV2ObservabilityHandler()
	v2SecurityHandler := handlers.NewV2SecurityHandler()
	v2DemoHandler := handlers.NewV2DemoHandler()
	v2AuthzHandler := handlers.NewV2AuthorizationHandler(authzService, privMonitorService, secAuditService)
	v2WebSecHandler := handlers.NewV2WebSecurityHandler(valService, xssService, fileSecService)
	v2APISecHandler := handlers.NewV2APISecurityHandler(apiKeyService, oauthService, adaptiveRateService, webhookService, apiAbuseEngine)
	v2InfraHandler := handlers.NewV2InfrastructureHandler(intraService)
	v2SecretsHandler := handlers.NewV2SecretsSecurityHandler(secretsService, cryptoService, leakService, envService)
	v2DBSecurityHandler := handlers.NewV2DatabaseSecurityHandler(dbSecurityService, dataEncryptService, dataClassService, dbAuditService, sqlSecurityService, backupService)
	v2IdentityHandler := handlers.NewV2IdentitySecurityHandler(tokenService, refreshTokenService, sessionSecService, mfaService, loginRiskService, authEventService)
	v2SIEMHandler := handlers.NewV2SIEMSecurityHandler(auditChainService, securityEventService, threatEngine, securityAlertService, timelineService)
	v2CICDHandler := handlers.NewV2CICDSecurityHandler(cicdSecurityService)
	v2DeploymentHandler := handlers.NewV2DeploymentSecurityHandler(readinessService, deploymentHealthService)
	v2DRHandler := handlers.NewV2BackupSecurityHandler(drBackupService, drRestoreService)
	v2ComplianceHandler := handlers.NewV2ComplianceHandler(privacyClassService, privacyPIIService, privacyMaskService, privacyRetService)
	v2ValidationHandler := handlers.NewV2SecurityValidationHandler(secAuditCheckService, secVulnService, secOwaspService, secSimService, secScoreService)
	v2AuditReportHandler := handlers.NewV2SecurityAuditReportHandler(secAuditReportService)
	v2AIAnalystHandler := handlers.NewV2AIAnalystHandler(aiAnalystService)
	v2DetectionEngHandler := handlers.NewV2DetectionEngineeringHandler(advancedDetectionService)
	v2IntelFusionHandler := handlers.NewV2ThreatIntelFusionHandler(threatIntelFusionService)
	v2IntegrationsHandler := handlers.NewV2EnterpriseIntegrationsHandler(enterpriseIntegrationsService)

	v2Group := router.Group("/api/v2")
	// ─── SECURITY: All /api/v2/* endpoints require JWT + Permission Guards ──────
	v2Group.Use(middleware.AuthMiddleware())
	{
		// Enterprise Integrations & Ecosystem Routes (Era 36)
		v2Group.GET("/integrations/targets", v2IntegrationsHandler.ListTargets)
		v2Group.GET("/integrations/targets/:id", v2IntegrationsHandler.GetTarget)
		v2Group.POST("/integrations/targets", middleware.RequirePermission(models.PermSystemConfiguration), v2IntegrationsHandler.CreateTarget)
		v2Group.PUT("/integrations/targets/:id", middleware.RequirePermission(models.PermSystemConfiguration), v2IntegrationsHandler.UpdateTarget)
		v2Group.DELETE("/integrations/targets/:id", middleware.RequirePermission(models.PermSystemConfiguration), v2IntegrationsHandler.DeleteTarget)
		v2Group.POST("/integrations/test", v2IntegrationsHandler.TestTarget)
		v2Group.GET("/integrations/pipelines", v2IntegrationsHandler.GetPipelines)
		v2Group.GET("/integrations/metrics", v2IntegrationsHandler.GetMetrics)

		// Threat Intelligence Fusion Routes (Era 35)
		v2Group.GET("/threat-intel/feeds", v2IntelFusionHandler.ListFeeds)
		v2Group.POST("/threat-intel/feeds/:id/sync", middleware.RequirePermission(models.PermSystemConfiguration), v2IntelFusionHandler.SyncFeed)
		v2Group.GET("/threat-intel/iocs", v2IntelFusionHandler.GetIOCs)
		v2Group.POST("/threat-intel/enrich", v2IntelFusionHandler.EnrichIOC)
		v2Group.GET("/threat-intel/health", v2IntelFusionHandler.GetHealth)

		// Advanced Detection Engineering Routes (Era 34)
		v2Group.GET("/detection/rules", v2DetectionEngHandler.ListRules)
		v2Group.GET("/detection/rules/:id", v2DetectionEngHandler.GetRule)
		v2Group.POST("/detection/rules", middleware.RequirePermission(models.PermSystemConfiguration), v2DetectionEngHandler.CreateRule)
		v2Group.PUT("/detection/rules/:id", middleware.RequirePermission(models.PermSystemConfiguration), v2DetectionEngHandler.UpdateRule)
		v2Group.DELETE("/detection/rules/:id", middleware.RequirePermission(models.PermSystemConfiguration), v2DetectionEngHandler.DeleteRule)
		v2Group.POST("/detection/test", v2DetectionEngHandler.TestRule)
		v2Group.POST("/detection/simulate", v2DetectionEngHandler.SimulateRule)
		v2Group.GET("/detection/metrics", v2DetectionEngHandler.GetMetrics)

		// AI Security Analyst Routes (Era 33)
		v2Group.POST("/ai-analyst/explain-alert", v2AIAnalystHandler.ExplainAlert)
		v2Group.POST("/ai-analyst/summarize-threat", v2AIAnalystHandler.SummarizeThreat)
		v2Group.POST("/ai-analyst/summarize-incident", v2AIAnalystHandler.SummarizeIncident)
		v2Group.POST("/ai-analyst/explain-timeline", v2AIAnalystHandler.ExplainTimeline)
		v2Group.POST("/ai-analyst/explain-ioc", v2AIAnalystHandler.ExplainIOC)
		v2Group.POST("/ai-analyst/explain-mitre", v2AIAnalystHandler.ExplainMITRE)
		v2Group.POST("/ai-analyst/threat-hunting-query", v2AIAnalystHandler.ThreatHuntingQuery)
		v2Group.POST("/ai-analyst/investigate-assistance", v2AIAnalystHandler.InvestigateAssistance)

		// DevSecOps Security Audit & Zero Trust Report Routes (Era 31)
		v2Group.GET("/security-audit/report", middleware.RequirePermission(models.PermViewAuditLogs), v2AuditReportHandler.GetReport)
		v2Group.POST("/security-audit/run", middleware.RequirePermission(models.PermSystemConfiguration), v2AuditReportHandler.RunAudit)

		// Enterprise Security Validation & Certification Routes (Era 30)
		v2Group.GET("/security-validation/status", v2ValidationHandler.GetStatus)
		v2Group.GET("/security-validation/audit", middleware.RequirePermission(models.PermViewAuditLogs), v2ValidationHandler.GetAudit)
		v2Group.GET("/security-validation/owasp", middleware.RequirePermission(models.PermViewAuditLogs), v2ValidationHandler.GetOWASP)
		v2Group.GET("/security-validation/vulnerabilities", middleware.RequirePermission(models.PermViewAuditLogs), v2ValidationHandler.GetVulnerabilities)
		v2Group.POST("/security-validation/run-scan", middleware.RequirePermission(models.PermSystemConfiguration), v2ValidationHandler.RunScan)
		// Privacy & Compliance Framework Routes (Era 29)
		v2Group.GET("/privacy-compliance/status", v2ComplianceHandler.GetComplianceStatus)
		v2Group.GET("/privacy-compliance/frameworks", middleware.RequirePermission(models.PermViewAuditLogs), v2ComplianceHandler.GetComplianceFrameworks)
		v2Group.GET("/privacy-compliance/pii-report", middleware.RequirePermission(models.PermViewAuditLogs), v2ComplianceHandler.GetPIIReport)
		v2Group.GET("/privacy-compliance/data-classification", middleware.RequirePermission(models.PermViewAuditLogs), v2ComplianceHandler.GetDataClassification)
		v2Group.POST("/privacy-compliance/privacy-scan", middleware.RequirePermission(models.PermSystemConfiguration), v2ComplianceHandler.ExecutePrivacyScan)

		v2Group.GET("/compliance/frameworks", middleware.RequirePermission(models.PermViewAuditLogs), v2ComplianceHandler.GetComplianceFrameworks)
		v2Group.GET("/compliance/pii-report", middleware.RequirePermission(models.PermViewAuditLogs), v2ComplianceHandler.GetPIIReport)
		v2Group.GET("/compliance/data-classification", middleware.RequirePermission(models.PermViewAuditLogs), v2ComplianceHandler.GetDataClassification)
		v2Group.POST("/compliance/privacy-scan", middleware.RequirePermission(models.PermSystemConfiguration), v2ComplianceHandler.ExecutePrivacyScan)

		// Enterprise Backup & Disaster Recovery Routes (Era 28)
		v2Group.GET("/backup/status", v2DRHandler.GetBackupStatus)
		v2Group.GET("/backup/history", middleware.RequirePermission(models.PermViewAuditLogs), v2DRHandler.GetBackupHistory)
		v2Group.GET("/backup/integrity", middleware.RequirePermission(models.PermViewAuditLogs), v2DRHandler.GetBackupIntegrity)
		v2Group.GET("/backup/recovery-readiness", middleware.RequirePermission(models.PermViewAuditLogs), v2DRHandler.GetRecoveryReadiness)
		v2Group.POST("/backup/restore-test", middleware.RequirePermission(models.PermSystemConfiguration), v2DRHandler.ExecuteRestoreTest)

		// Production Deployment Security Routes (Era 27)
		v2Group.GET("/deployment/posture", v2DeploymentHandler.GetPosture)
		v2Group.GET("/deployment/config", middleware.RequirePermission(models.PermViewAuditLogs), v2DeploymentHandler.GetConfig)
		v2Group.GET("/deployment/tls", middleware.RequirePermission(models.PermViewAuditLogs), v2DeploymentHandler.GetTLS)
		v2Group.GET("/deployment/health", middleware.RequirePermission(models.PermViewAuditLogs), v2DeploymentHandler.GetHealth)
		v2Group.GET("/deployment/rollback", middleware.RequirePermission(models.PermSystemConfiguration), v2DeploymentHandler.GetRollback)

		// CI/CD Security & SSDLC Routes (Era 26)
		v2Group.GET("/cicd-security/posture", v2CICDHandler.GetPosture)
		v2Group.GET("/cicd-security/scans", middleware.RequirePermission(models.PermViewAuditLogs), v2CICDHandler.GetScans)
		v2Group.GET("/cicd-security/vulnerabilities", middleware.RequirePermission(models.PermViewAuditLogs), v2CICDHandler.GetVulnerabilities)
		v2Group.GET("/cicd-security/sbom", middleware.RequirePermission(models.PermViewAuditLogs), v2CICDHandler.GetSBOM)

		// SIEM-Grade Logging & Security Monitoring Routes (Era 25)
		v2Group.GET("/siem/posture", v2SIEMHandler.GetSIEMPosture)
		v2Group.GET("/siem/events", middleware.RequirePermission(models.PermViewAuditLogs), v2SIEMHandler.GetEvents)
		v2Group.GET("/siem/alerts", middleware.RequirePermission(models.PermViewAuditLogs), v2SIEMHandler.GetAlerts)
		v2Group.GET("/siem/timeline", middleware.RequirePermission(models.PermViewAuditLogs), v2SIEMHandler.GetTimeline)
		v2Group.GET("/siem/integrity", middleware.RequirePermission(models.PermViewAuditLogs), v2SIEMHandler.GetIntegrity)
		v2Group.POST("/siem/alerts/:id/resolve", middleware.RequirePermission(models.PermSystemConfiguration), v2SIEMHandler.ResolveAlert)

		// Secure Session & Advanced Identity Routes (Era 24)
		v2Group.GET("/identity/posture", v2IdentityHandler.GetIdentityPosture)
		v2Group.GET("/identity/sessions", middleware.RequirePermission(models.PermViewAuditLogs), v2IdentityHandler.GetSessions)
		v2Group.POST("/identity/session/revoke", middleware.RequirePermission(models.PermSystemConfiguration), v2IdentityHandler.RevokeSession)
		v2Group.POST("/identity/session/revoke-all", middleware.RequirePermission(models.PermSystemConfiguration), v2IdentityHandler.RevokeAllUserSessions)
		v2Group.POST("/identity/mfa/setup", v2IdentityHandler.SetupMFA)
		v2Group.POST("/identity/mfa/verify", v2IdentityHandler.VerifyMFA)
		v2Group.POST("/identity/refresh", v2IdentityHandler.RefreshToken)
		v2Group.GET("/identity/events", middleware.RequirePermission(models.PermViewAuditLogs), v2IdentityHandler.GetEvents)
		v2Group.GET("/identity/risk", v2IdentityHandler.EvaluateRisk)

		// Database Security & Data Protection Routes (Era 23)
		v2Group.GET("/database/posture", v2DBSecurityHandler.GetDatabasePosture)
		v2Group.GET("/database/config", middleware.RequirePermission(models.PermViewAuditLogs), v2DBSecurityHandler.GetDatabaseConfig)
		v2Group.GET("/database/access", middleware.RequirePermission(models.PermViewAuditLogs), v2DBSecurityHandler.GetDatabaseAccess)
		v2Group.GET("/database/audit", middleware.RequirePermission(models.PermViewAuditLogs), v2DBSecurityHandler.GetDatabaseAudit)
		v2Group.GET("/database/encryption", v2DBSecurityHandler.GetDatabaseEncryption)
		v2Group.GET("/database/backups", middleware.RequirePermission(models.PermViewAuditLogs), v2DBSecurityHandler.GetDatabaseBackups)

		// Secrets Management & Cryptographic Security Routes (Era 22)
		v2Group.GET("/secrets/posture", v2SecretsHandler.GetSecretsPosture)
		v2Group.GET("/secrets/list", middleware.RequirePermission(models.PermViewAuditLogs), v2SecretsHandler.GetSecretsList)
		v2Group.GET("/secrets/status", v2SecretsHandler.GetSecretsStatus)
		v2Group.POST("/secrets/register", middleware.RequirePermission(models.PermSystemConfiguration), v2SecretsHandler.RegisterSecret)
		v2Group.POST("/secrets/rotate", middleware.RequirePermission(models.PermSystemConfiguration), v2SecretsHandler.RotateSecret)
		v2Group.GET("/secrets/events", middleware.RequirePermission(models.PermViewAuditLogs), v2SecretsHandler.GetSecretEvents)
		v2Group.GET("/crypto/posture", v2SecretsHandler.GetCryptoPosture)

		// Infrastructure & Platform Security Routes (Era 21)
		v2Group.GET("/infra/posture", v2InfraHandler.GetInfraPosture)
		v2Group.GET("/infra/hardening", middleware.RequirePermission(models.PermViewAuditLogs), v2InfraHandler.GetHardeningChecks)
		v2Group.GET("/infra/docker", middleware.RequirePermission(models.PermViewAuditLogs), v2InfraHandler.GetDockerSecurity)
		v2Group.GET("/infra/network", v2InfraHandler.GetNetworkSegmentation)
		v2Group.GET("/infra/tls", v2InfraHandler.GetTLSControls)

		// API Security Layer Routes
		v2Group.GET("/api-security/posture", v2APISecHandler.GetAPIPosture)
		v2Group.GET("/api-security/keys", v2APISecHandler.GetAPIKeys)
		v2Group.POST("/api-security/keys", middleware.RequirePermission(models.PermSystemConfiguration), v2APISecHandler.CreateAPIKey)
		v2Group.POST("/api-security/keys/revoke", middleware.RequirePermission(models.PermSystemConfiguration), v2APISecHandler.RevokeAPIKey)
		v2Group.GET("/api-security/events", middleware.RequirePermission(models.PermViewAuditLogs), v2APISecHandler.GetAPIThreatEvents)
		v2Group.GET("/api-security/oauth/clients", v2APISecHandler.GetOAuthClients)
		v2Group.GET("/api-security/webhooks", v2APISecHandler.GetWebhooks)

		// CSRF Token Endpoint & Web Security Endpoints
		v2Group.GET("/security/csrf-token", middleware.CSRFTokenHandler)
		v2Group.GET("/web-security/posture", v2WebSecHandler.GetWebSecurityPosture)
		v2Group.GET("/web-security/events", v2WebSecHandler.GetAttackLogs)
		v2Group.POST("/web-security/test-input", v2WebSecHandler.TestInput)
		v2Group.POST("/web-security/file-check", v2WebSecHandler.ValidateFileUpload)
		v2Group.POST("/security/files/validate", v2WebSecHandler.ValidateFileUpload)

		// Authorization & RBAC Management Routes
		v2Group.GET("/authz/me", v2AuthzHandler.GetMyPermissions)
		v2Group.POST("/authz/check", v2AuthzHandler.CheckPermission)
		v2Group.GET("/authz/roles", v2AuthzHandler.GetRoleMatrix)
		v2Group.GET("/authz/violations", middleware.RequirePermission(models.PermViewAuditLogs), v2AuthzHandler.GetViolations)
		v2Group.GET("/authz/events", middleware.RequirePermission(models.PermViewAuditLogs), v2AuthzHandler.GetAuthzEvents)

		// AI Copilot Routes
		v2Group.POST("/copilot/query", v2CopilotHandler.QueryCopilot)
		v2Group.GET("/copilot/prompts", v2CopilotHandler.GetCopilotPrompts)

		// AI Threat Investigation Routes
		v2Group.GET("/investigations", v2InvestigationHandler.GetInvestigations)
		v2Group.GET("/investigations/:id", v2InvestigationHandler.GetInvestigationByID)
		v2Group.POST("/investigations/generate", v2InvestigationHandler.GenerateInvestigation)

		// MITRE ATT&CK Intelligence Routes
		v2Group.GET("/mitre/matrix", v2MITREHandler.GetMatrix)
		v2Group.GET("/mitre/techniques", v2MITREHandler.GetTechniques)
		v2Group.GET("/mitre/techniques/:id", v2MITREHandler.GetTechniqueByID)
		v2Group.GET("/mitre/statistics", v2MITREHandler.GetStatistics)
		v2Group.GET("/mitre/heatmap", v2MITREHandler.GetHeatMap)
		v2Group.POST("/mitre/explain", v2MITREHandler.ExplainTechnique)

		// Detection Engineering Studio Routes (Permission Protected)
		v2Group.GET("/detections/rules", middleware.RequirePermission(models.PermViewIncidents), v2DetectionHandler.GetRules)
		v2Group.POST("/detections/rules", middleware.RequirePermission(models.PermCreateRules), v2DetectionHandler.CreateRule)
		v2Group.GET("/detections/rules/:id", middleware.RequirePermission(models.PermViewIncidents), v2DetectionHandler.GetRuleByID)
		v2Group.PUT("/detections/rules/:id", middleware.RequirePermission(models.PermModifyRules), v2DetectionHandler.UpdateRule)
		v2Group.DELETE("/detections/rules/:id", middleware.RequirePermission(models.PermModifyRules), v2DetectionHandler.DeleteRule)
		v2Group.POST("/detections/rules/:id/toggle", middleware.RequirePermission(models.PermModifyRules), v2DetectionHandler.ToggleRule)
		v2Group.POST("/detections/test", middleware.RequirePermission(models.PermCreateRules), v2DetectionHandler.TestRule)
		v2Group.POST("/detections/simulate", middleware.RequirePermission(models.PermCreateRules), v2DetectionHandler.Simulate)
		v2Group.GET("/detections/analytics", v2DetectionHandler.GetAnalytics)
		v2Group.POST("/detections/ai-assistant", v2DetectionHandler.AIAssistant)

		// Threat Intelligence Fusion Routes
		v2Group.GET("/intelligence", v2IntelligenceHandler.GetOverview)
		v2Group.GET("/intelligence/ip/:value", v2IntelligenceHandler.LookupIP)
		v2Group.GET("/intelligence/domain/:value", v2IntelligenceHandler.LookupDomain)
		v2Group.GET("/intelligence/ioc/:value", v2IntelligenceHandler.LookupIOC)
		v2Group.POST("/intelligence/enrich", v2IntelligenceHandler.EnrichIOC)
		v2Group.GET("/intelligence/history", v2IntelligenceHandler.GetHistory)

		// UEBA & Behaviour Analytics Routes
		v2Group.GET("/ueba", v2UEBAHandler.GetOverview)
		v2Group.GET("/ueba/entities", v2UEBAHandler.GetEntities)
		v2Group.GET("/ueba/anomalies", v2UEBAHandler.GetAnomalies)
		v2Group.GET("/ueba/risk/:entity", v2UEBAHandler.GetEntityRisk)
		v2Group.GET("/ueba/history", v2UEBAHandler.GetHistory)

		// AI Detection Optimizer Routes
		v2Group.GET("/optimizer", v2OptimizerHandler.GetOverview)
		v2Group.GET("/optimizer/rules", v2OptimizerHandler.GetRules)
		v2Group.GET("/optimizer/recommendations", v2OptimizerHandler.GetRecommendations)
		v2Group.GET("/optimizer/gaps", v2OptimizerHandler.GetGaps)
		v2Group.POST("/optimizer/feedback", v2OptimizerHandler.SubmitFeedback)
		v2Group.POST("/optimizer/analyze", v2OptimizerHandler.AnalyzeRule)

		// AI Incident Management Desk Routes (Permission Protected)
		v2Group.GET("/incidents", v2IncidentHandler.GetOverview)
		v2Group.GET("/incidents/list", v2IncidentHandler.GetIncidents)
		v2Group.GET("/incidents/:id", v2IncidentHandler.GetIncidentByID)
		v2Group.POST("/incidents/create", middleware.RequirePermission(models.PermCreateIncidents), v2IncidentHandler.CreateIncident)
		v2Group.POST("/incidents/:id/evidence", middleware.RequirePermission(models.PermCreateIncidents), v2IncidentHandler.AddEvidence)
		v2Group.POST("/incidents/:id/assign", middleware.RequirePermission(models.PermCreateIncidents), v2IncidentHandler.AssignAnalyst)
		v2Group.POST("/incidents/:id/close", middleware.RequirePermission(models.PermCloseIncidents), v2IncidentHandler.CloseIncident)

		// AI Executive Reporting & Compliance Routes (Permission Protected)
		v2Group.GET("/reports", v2ReportHandler.GetReports)
		v2Group.POST("/reports/generate", middleware.RequirePermission(models.PermExportReports), v2ReportHandler.GenerateReport)
		v2Group.GET("/reports/export/:id", middleware.RequirePermission(models.PermExportReports), v2ReportHandler.ExportReport)
		v2Group.GET("/compliance", v2ReportHandler.GetCompliance)
		v2Group.GET("/compliance/status", v2ReportHandler.GetComplianceStatus)

		// Interactive Attack Graph & Threat Path Routes
		v2Group.GET("/attack-graph", v2AttackGraphHandler.GetGraph)
		v2Group.GET("/attack-graph/nodes", v2AttackGraphHandler.GetNodes)
		v2Group.GET("/attack-graph/edges", v2AttackGraphHandler.GetEdges)
		v2Group.GET("/attack-graph/path/:id", v2AttackGraphHandler.GetPathByID)
		v2Group.POST("/attack-graph/explain", v2AttackGraphHandler.ExplainPath)

		// Historical Investigation & AI Threat Hunting Routes (Permission Protected)
		v2Group.GET("/history/search", v2HistoricalHandler.SearchEvents)
		v2Group.GET("/history/events", v2HistoricalHandler.GetEvents)
		v2Group.GET("/history/ioc/:value", v2HistoricalHandler.GetIOCHistory)
		v2Group.GET("/history/replay/:id", v2HistoricalHandler.GetReplayByID)
		v2Group.POST("/hunting/query", middleware.RequirePermission(models.PermRunThreatHunts), v2HistoricalHandler.RunHuntQuery)
		v2Group.GET("/hunting/hypothesis", v2HistoricalHandler.GetHuntHypothesis)

		// AI Workflow Automation & SOAR Playbook Routes (Permission Protected)
		v2Group.GET("/workflows", v2WorkflowHandler.GetWorkflows)
		v2Group.POST("/workflows", middleware.RequirePermission(models.PermExecutePlaybooks), v2WorkflowHandler.CreateWorkflow)
		v2Group.GET("/workflows/templates", v2WorkflowHandler.GetTemplates)
		v2Group.POST("/workflows/execute", middleware.RequirePermission(models.PermExecutePlaybooks), v2WorkflowHandler.ExecuteWorkflow)
		v2Group.GET("/workflows/history", v2WorkflowHandler.GetHistory)
		v2Group.GET("/workflows/status/:id", v2WorkflowHandler.GetExecutionStatus)
		v2Group.GET("/workflows/approvals", v2WorkflowHandler.GetApprovals)
		v2Group.POST("/workflows/approvals/decide", middleware.RequirePermission(models.PermExecutePlaybooks), v2WorkflowHandler.DecideApproval)
		v2Group.POST("/workflows/playbooks", middleware.RequirePermission(models.PermExecutePlaybooks), v2WorkflowHandler.GeneratePlaybook)

		// Observability, Audit & Platform Health Routes
		v2Group.GET("/audit/logs", middleware.RequirePermission(models.PermViewAuditLogs), v2ObservabilityHandler.GetAuditLogs)
		v2Group.GET("/audit/search", middleware.RequirePermission(models.PermViewAuditLogs), v2ObservabilityHandler.SearchAuditLogs)
		v2Group.GET("/audit/export", middleware.RequirePermission(models.PermExportReports), v2ObservabilityHandler.ExportAuditLogs)
		v2Group.GET("/health", v2ObservabilityHandler.GetHealth)
		v2Group.GET("/health/services", v2ObservabilityHandler.GetHealthServices)
		v2Group.GET("/system/health", v2ObservabilityHandler.GetSystemHealth)
		v2Group.GET("/metrics", v2ObservabilityHandler.GetMetrics)
		v2Group.GET("/metrics/security", v2ObservabilityHandler.GetSecurityMetrics)

		// Phase 3 Event-Driven Bus & Worker Routes
		v2EventBusHandler := handlers.NewV2EventBusHandler()
		v2Group.GET("/events/stream", v2EventBusHandler.GetStream)
		v2Group.GET("/events/history", v2EventBusHandler.GetHistory)
		v2Group.GET("/events/workers/status", v2EventBusHandler.GetWorkerStatus)
		v2Group.GET("/events/dlq", v2EventBusHandler.GetDLQ)

		// Enterprise Security Hardening & RBAC Routes
		v2Group.GET("/security/posture", v2SecurityHandler.GetPosture)
		v2Group.GET("/security/rbac", v2SecurityHandler.GetRBAC)
		v2Group.GET("/security/sessions", v2SecurityHandler.GetActiveSessions)
		v2Group.POST("/security/sessions/revoke", middleware.RequirePermission(models.PermSystemConfiguration), v2SecurityHandler.RevokeSession)
		v2Group.GET("/security/events", v2SecurityHandler.GetEvents)

		// Enterprise Attack Scenario Demo Loader Routes
		v2Group.GET("/demo/scenarios", v2DemoHandler.GetScenarios)
		v2Group.POST("/demo/load", v2DemoHandler.LoadScenario)
	}
}
