package models

import "time"

type APIKey struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	KeyHash     string    `json:"-"`
	Prefix      string    `json:"prefix"`
	OwnerID     string    `json:"owner_id"`
	Permissions []string  `json:"permissions"`
	CreatedAt   time.Time `json:"created_at"`
	ExpiryDate  time.Time `json:"expiry_date"`
	LastUsed    time.Time `json:"last_used"`
	Status      string    `json:"status"` // ACTIVE, REVOKED, EXPIRED
}
