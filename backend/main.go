package main

import (
	"fmt"

	"netsentinel-x-backend/config"
	"netsentinel-x-backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()

	config.ConnectDatabase()

	router := gin.Default()

	routes.SetupRoutes(router)

	port := config.GetEnv("PORT")

	fmt.Println("NetSentinel-X Backend Running On Port:", port)

	router.Run(":" + port)
}