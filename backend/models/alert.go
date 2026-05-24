package models

import "time"

type Alert struct {
	ID             int       `json:"id"`
	SourceIP       string    `json:"source_ip"`
	DestinationIP  string    `json:"destination_ip"`
	Protocol       string    `json:"protocol"`
	Port           int       `json:"port"`
	AlertMessage   string    `json:"alert_message"`
	Severity       string    `json:"severity"`
	CreatedAt      time.Time `json:"created_at"`
}