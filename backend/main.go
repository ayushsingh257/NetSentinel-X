package main

import (
	"fmt"

	"netsentinel-x-backend/config"
	"netsentinel-x-backend/routes"
	"netsentinel-x-backend/packetcapture"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	config.LoadEnv()

	config.ConnectDatabase()

	go packetcapture.StartPacketCapture()

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
		},

		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},

		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},

		ExposeHeaders: []string{
			"Content-Length",
		},

		AllowCredentials: true,
	}))

	routes.SetupRoutes(router)

	port := config.GetEnv("PORT")

	fmt.Println("NetSentinel-X Backend Running On Port:", port)

	router.Run(":" + port)
}