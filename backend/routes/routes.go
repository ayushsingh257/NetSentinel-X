package routes

import (
	"netsentinel-x-backend/handlers"
	"netsentinel-x-backend/middleware"
	"netsentinel-x-backend/websocket"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

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
}