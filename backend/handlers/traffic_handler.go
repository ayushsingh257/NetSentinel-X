package handlers

import (
	"net/http"

	"netsentinel-x-backend/config"
	"netsentinel-x-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateTrafficLog(c *gin.Context) {
	var traffic models.TrafficLog

	if err := c.ShouldBindJSON(&traffic); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request payload",
		})
		return
	}

	query := `
		INSERT INTO traffic_logs
		(source_ip, destination_ip, protocol, port, status)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := config.DB.Exec(
		query,
		traffic.SourceIP,
		traffic.DestinationIP,
		traffic.Protocol,
		traffic.Port,
		traffic.Status,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to insert traffic log",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Traffic log created successfully",
	})
}

func GetTrafficLogs(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id, source_ip, destination_ip, protocol, port, status, created_at
		FROM traffic_logs
		ORDER BY created_at DESC
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch traffic logs",
		})
		return
	}

	defer rows.Close()

	logs := []models.TrafficLog{}

	for rows.Next() {
		var traffic models.TrafficLog

		err := rows.Scan(
			&traffic.ID,
			&traffic.SourceIP,
			&traffic.DestinationIP,
			&traffic.Protocol,
			&traffic.Port,
			&traffic.Status,
			&traffic.CreatedAt,
		)

		if err != nil {
			continue
		}

		logs = append(logs, traffic)
	}

	c.JSON(http.StatusOK, logs)
}