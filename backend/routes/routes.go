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

	router.POST("/login", handlers.LoginHandler)

	authorized := router.Group("/")
	authorized.Use(middleware.AuthMiddleware())
	{

		authorized.GET("/traffic", handlers.GetTrafficLogs)

		authorized.GET("/alerts", handlers.GetAlerts)

		authorized.GET("/export/traffic", handlers.ExportTrafficReport)

		authorized.GET("/ws", websocket.HandleWebSocket)
	}

	adminRoutes := router.Group("/")
	adminRoutes.Use(
		middleware.AuthMiddleware(),
		middleware.AdminOnly(),
	)
	{

		adminRoutes.POST("/traffic", handlers.CreateTrafficLog)
	}
}