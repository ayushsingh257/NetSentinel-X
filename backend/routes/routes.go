package routes

import (
	"netsentinel-x-backend/handlers"
	"netsentinel-x-backend/middleware"
	"netsentinel-x-backend/websocket"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

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
	}
}
