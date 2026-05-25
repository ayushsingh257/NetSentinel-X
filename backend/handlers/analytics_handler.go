package handlers

import (
	"net/http"

	"netsentinel-x-backend/config"

	"github.com/gin-gonic/gin"
)

func GetAnalytics(c *gin.Context) {

	var totalPackets int
	var totalAlerts int
	var highAlerts int

	// TOTAL PACKETS
	config.DB.QueryRow(`
		SELECT COUNT(*) FROM traffic_logs
	`).Scan(&totalPackets)

	// TOTAL ALERTS
	config.DB.QueryRow(`
		SELECT COUNT(*) FROM alerts
	`).Scan(&totalAlerts)

	// HIGH SEVERITY ALERTS
	config.DB.QueryRow(`
		SELECT COUNT(*) FROM alerts
		WHERE severity='HIGH'
	`).Scan(&highAlerts)

	c.JSON(http.StatusOK, gin.H{
		"total_packets": totalPackets,
		"total_alerts":  totalAlerts,
		"high_alerts":   highAlerts,
	})
}