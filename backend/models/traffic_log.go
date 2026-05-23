package models

import "time"

type TrafficLog struct {
	ID            int       `json:"id"`
	SourceIP      string    `json:"source_ip"`
	DestinationIP string    `json:"destination_ip"`
	Protocol      string    `json:"protocol"`
	Port          int       `json:"port"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}