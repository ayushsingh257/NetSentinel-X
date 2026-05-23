package models

import "time"

type Alert struct {
	ID        int       `json:"id"`
	AlertType string    `json:"alert_type"`
	Severity  string    `json:"severity"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}