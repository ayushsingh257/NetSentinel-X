package handlers

import (
	"net/http"

	"netsentinel-x-backend/config"
	"netsentinel-x-backend/models"

	"github.com/gin-gonic/gin"
)

func GetAlerts(c *gin.Context) {

	rows, err := config.DB.Query(`
		SELECT 
			id,
			source_ip,
			destination_ip,
			protocol,
			port,
			alert_message,
			severity,
			created_at
		FROM alerts
		ORDER BY created_at DESC
		LIMIT 100
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch alerts",
		})
		return
	}

	defer rows.Close()

	var alerts []models.Alert

	for rows.Next() {

		var alert models.Alert

		err := rows.Scan(
			&alert.ID,
			&alert.SourceIP,
			&alert.DestinationIP,
			&alert.Protocol,
			&alert.Port,
			&alert.AlertMessage,
			&alert.Severity,
			&alert.CreatedAt,
		)

		if err != nil {
			continue
		}

		alerts = append(alerts, alert)
	}

	c.JSON(http.StatusOK, alerts)
}