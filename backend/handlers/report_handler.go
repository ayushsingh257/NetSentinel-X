package handlers

import (
	"encoding/csv"
	"net/http"
	"strconv"

	"netsentinel-x-backend/config"

	"github.com/gin-gonic/gin"
)

func ExportTrafficReport(c *gin.Context) {

	rows, err := config.DB.Query(`
		SELECT id, source_ip, destination_ip, protocol, port, status
		FROM traffic_logs
		ORDER BY id DESC
	`)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch traffic logs",
		})

		return
	}

	defer rows.Close()

	c.Header("Content-Type", "text/csv")
	c.Header(
		"Content-Disposition",
		"attachment;filename=traffic_report.csv",
	)

	writer := csv.NewWriter(c.Writer)

	defer writer.Flush()

	writer.Write([]string{
		"ID",
		"Source IP",
		"Destination IP",
		"Protocol",
		"Port",
		"Status",
	})

	for rows.Next() {

		var id int
		var sourceIP string
		var destinationIP string
		var protocol string
		var port int
		var status string

		rows.Scan(
			&id,
			&sourceIP,
			&destinationIP,
			&protocol,
			&port,
			&status,
		)

		writer.Write([]string{
			strconv.Itoa(id),
			sourceIP,
			destinationIP,
			protocol,
			strconv.Itoa(port),
			status,
		})
	}
}