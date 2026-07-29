package models

import "time"

type WebhookEndpoint struct {
	ID         string    `json:"id"`
	URL        string    `json:"url"`
	SecretHash string    `json:"-"`
	Events     []string  `json:"events"`
	Status     string    `json:"status"` // ACTIVE, DISABLED
	CreatedAt  time.Time `json:"created_at"`
	Deliveries int       `json:"deliveries"`
}
