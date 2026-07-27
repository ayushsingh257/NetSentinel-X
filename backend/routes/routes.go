package routes

import (
	"netsentinel-x-backend/handlers"
	"netsentinel-x-backend/middleware"
	"netsentinel-x-backend/websocket"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	// Apply Global Security Headers Middleware
	router.Use(middleware.SecurityHeadersMiddleware())

	// Legacy V1 Routes (Maintained for 100% backward compatibility)
	router.GET("/", handlers.HomeHandler)
	router.GET("/health", handlers.HealthHandler)
	router.GET("/analytics", handlers.GetAnalytics)
	router.POST("/login", handlers.LoginHandler)
	router.GET("/traffic", handlers.GetTrafficLogs)
	router.GET("/alerts", handlers.GetAlerts)
	router.GET("/export/traffic", handlers.ExportTrafficReport)
	router.GET("/ws", websocket.HandleWebSocket)

	adminRoutes := router.Group("/")
	adminRoutes.Use(
		middleware.AuthMiddleware(),
		middleware.AdminOnly(),
	)
	{
		adminRoutes.POST("/traffic", handlers.CreateTrafficLog)
	}

	// NetSentinel-X V2 Enterprise API Group
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

	v2Group := router.Group("/api/v2")
	{
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

		// Detection Engineering Studio Routes
		v2Group.GET("/detections/rules", v2DetectionHandler.GetRules)
		v2Group.POST("/detections/rules", v2DetectionHandler.CreateRule)
		v2Group.GET("/detections/rules/:id", v2DetectionHandler.GetRuleByID)
		v2Group.PUT("/detections/rules/:id", v2DetectionHandler.UpdateRule)
		v2Group.DELETE("/detections/rules/:id", v2DetectionHandler.DeleteRule)
		v2Group.POST("/detections/rules/:id/toggle", v2DetectionHandler.ToggleRule)
		v2Group.POST("/detections/test", v2DetectionHandler.TestRule)
		v2Group.POST("/detections/simulate", v2DetectionHandler.Simulate)
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

		// AI Incident Management Desk Routes
		v2Group.GET("/incidents", v2IncidentHandler.GetOverview)
		v2Group.GET("/incidents/list", v2IncidentHandler.GetIncidents)
		v2Group.GET("/incidents/:id", v2IncidentHandler.GetIncidentByID)
		v2Group.POST("/incidents/create", v2IncidentHandler.CreateIncident)
		v2Group.POST("/incidents/:id/evidence", v2IncidentHandler.AddEvidence)
		v2Group.POST("/incidents/:id/assign", v2IncidentHandler.AssignAnalyst)
		v2Group.POST("/incidents/:id/close", v2IncidentHandler.CloseIncident)

		// AI Executive Reporting & Compliance Routes
		v2Group.GET("/reports", v2ReportHandler.GetReports)
		v2Group.POST("/reports/generate", v2ReportHandler.GenerateReport)
		v2Group.GET("/reports/export/:id", v2ReportHandler.ExportReport)
		v2Group.GET("/compliance", v2ReportHandler.GetCompliance)
		v2Group.GET("/compliance/status", v2ReportHandler.GetComplianceStatus)

		// Interactive Attack Graph & Threat Path Routes
		v2Group.GET("/attack-graph", v2AttackGraphHandler.GetGraph)
		v2Group.GET("/attack-graph/nodes", v2AttackGraphHandler.GetNodes)
		v2Group.GET("/attack-graph/edges", v2AttackGraphHandler.GetEdges)
		v2Group.GET("/attack-graph/path/:id", v2AttackGraphHandler.GetPathByID)
		v2Group.POST("/attack-graph/explain", v2AttackGraphHandler.ExplainPath)

		// Historical Investigation & AI Threat Hunting Routes
		v2Group.GET("/history/search", v2HistoricalHandler.SearchEvents)
		v2Group.GET("/history/events", v2HistoricalHandler.GetEvents)
		v2Group.GET("/history/ioc/:value", v2HistoricalHandler.GetIOCHistory)
		v2Group.GET("/history/replay/:id", v2HistoricalHandler.GetReplayByID)
		v2Group.POST("/hunting/query", v2HistoricalHandler.RunHuntQuery)
		v2Group.GET("/hunting/hypothesis", v2HistoricalHandler.GetHuntHypothesis)

		// AI Workflow Automation & SOAR Playbook Routes
		v2Group.GET("/workflows", v2WorkflowHandler.GetWorkflows)
		v2Group.POST("/workflows", v2WorkflowHandler.CreateWorkflow)
		v2Group.GET("/workflows/templates", v2WorkflowHandler.GetTemplates)
		v2Group.POST("/workflows/execute", v2WorkflowHandler.ExecuteWorkflow)
		v2Group.GET("/workflows/history", v2WorkflowHandler.GetHistory)
		v2Group.GET("/workflows/status/:id", v2WorkflowHandler.GetExecutionStatus)
		v2Group.GET("/workflows/approvals", v2WorkflowHandler.GetApprovals)
		v2Group.POST("/workflows/approvals/decide", v2WorkflowHandler.DecideApproval)
		v2Group.POST("/workflows/playbooks", v2WorkflowHandler.GeneratePlaybook)

		// Observability, Audit & Platform Health Routes
		v2Group.GET("/audit/logs", v2ObservabilityHandler.GetAuditLogs)
		v2Group.GET("/audit/search", v2ObservabilityHandler.SearchAuditLogs)
		v2Group.GET("/audit/export", v2ObservabilityHandler.ExportAuditLogs)
		v2Group.GET("/health", v2ObservabilityHandler.GetHealth)
		v2Group.GET("/health/services", v2ObservabilityHandler.GetHealthServices)
		v2Group.GET("/metrics", v2ObservabilityHandler.GetMetrics)
		v2Group.GET("/metrics/security", v2ObservabilityHandler.GetSecurityMetrics)

		// Enterprise Security Hardening & RBAC Routes
		v2Group.GET("/security/posture", v2SecurityHandler.GetPosture)
		v2Group.GET("/security/rbac", v2SecurityHandler.GetRBAC)
		v2Group.GET("/security/sessions", v2SecurityHandler.GetActiveSessions)
		v2Group.POST("/security/sessions/revoke", v2SecurityHandler.RevokeSession)
		v2Group.GET("/security/events", v2SecurityHandler.GetEvents)

		// Enterprise Attack Scenario Demo Loader Routes
		v2Group.GET("/demo/scenarios", v2DemoHandler.GetScenarios)
		v2Group.POST("/demo/load", v2DemoHandler.LoadScenario)
	}
}
