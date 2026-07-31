package main

import (
	"fmt"
	"strings"

	"netsentinel-x-backend/config"
	"netsentinel-x-backend/packetcapture"
	"netsentinel-x-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()
	config.ConnectDatabase()

	if config.GetEnv("RENDER") != "true" {
		go packetcapture.StartPacketCapture()
	}

	router := gin.Default()

	// ─── Production Ready Dynamic CORS Configuration ────────────────────────────
	corsOrigins := config.GetEnv("CORS_ALLOWED_ORIGINS")
	allowedList := []string{
		"http://localhost:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3000",
	}

	if frontendURL := config.GetEnv("FRONTEND_URL"); frontendURL != "" {
		allowedList = append(allowedList, frontendURL)
	}

	if corsOrigins != "" {
		for _, o := range strings.Split(corsOrigins, ",") {
			o = strings.TrimSpace(o)
			if o != "" {
				allowedList = append(allowedList, o)
			}
		}
	}

	corsConfig := cors.Config{
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
			"X-CSRF-Token",
			"X-API-Key",
		},
		ExposeHeaders: []string{
			"Content-Length",
			"Content-Range",
			"X-Total-Count",
		},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			// Allow exact matches from config
			for _, allowed := range allowedList {
				if origin == allowed {
					return true
				}
			}
			// Allow Vercel preview/production deployments (*.vercel.app)
			if strings.HasSuffix(origin, ".vercel.app") {
				return true
			}
			return false
		},
	}

	router.Use(cors.New(corsConfig))

	routes.SetupRoutes(router)

	port := config.GetEnv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("NetSentinel-X Enterprise Engine Running On Port:", port)
	router.Run(":" + port)
}
