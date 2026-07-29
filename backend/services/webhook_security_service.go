package services

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type WebhookDeliveryPayload struct {
	Event     string                 `json:"event"`
	ID        string                 `json:"id"`
	Timestamp time.Time              `json:"timestamp"`
	Data      map[string]interface{} `json:"data"`
}

type WebhookSecurityService struct {
	mu             sync.RWMutex
	webhooks       map[string]models.WebhookEndpoint // id -> webhook
	plainSecretMap map[string]string                 // id -> plaintextSecret
}

func NewWebhookSecurityService() *WebhookSecurityService {
	s := &WebhookSecurityService{
		webhooks:       make(map[string]models.WebhookEndpoint),
		plainSecretMap: make(map[string]string),
	}
	s.seedDefaultWebhook()
	return s
}

func (s *WebhookSecurityService) seedDefaultWebhook() {
	id := "WH-1001"
	secret := "whsec_live_9982h38d823h823"
	hash := sha256.Sum256([]byte(secret))

	s.webhooks[id] = models.WebhookEndpoint{
		ID:         id,
		URL:        "https://siem.enterprise.internal/hooks/netsentinel",
		SecretHash: hex.EncodeToString(hash[:]),
		Events:     []string{"incident.created", "threat.detected", "playbook.executed"},
		Status:     "ACTIVE",
		CreatedAt:  time.Now().Add(-48 * time.Hour),
		Deliveries: 142,
	}
	s.plainSecretMap[id] = secret
}

// RegisterWebhook creates a new webhook destination with generated HMAC secret.
func (s *WebhookSecurityService) RegisterWebhook(url string, events []string) (string, models.WebhookEndpoint) {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	rawSecret := fmt.Sprintf("whsec_%s", hex.EncodeToString(b))

	hash := sha256.Sum256([]byte(rawSecret))
	id := fmt.Sprintf("WH-%d", time.Now().UnixNano()%100000)

	ep := models.WebhookEndpoint{
		ID:         id,
		URL:        url,
		SecretHash: hex.EncodeToString(hash[:]),
		Events:     events,
		Status:     "ACTIVE",
		CreatedAt:  time.Now(),
		Deliveries: 0,
	}

	s.mu.Lock()
	s.webhooks[id] = ep
	s.plainSecretMap[id] = rawSecret
	s.mu.Unlock()

	return rawSecret, ep
}

// SignPayload generates X-Webhook-Signature header value HMAC-SHA256(payloadBytes, secret).
func (s *WebhookSecurityService) SignPayload(payloadBytes []byte, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payloadBytes)
	return fmt.Sprintf("sha256=%s", hex.EncodeToString(mac.Sum(nil)))
}

// ConstructDeliveryPayload formats standard webhook payload.
func (s *WebhookSecurityService) ConstructDeliveryPayload(event, resourceID string, data map[string]interface{}) ([]byte, string, error) {
	p := WebhookDeliveryPayload{
		Event:     event,
		ID:        resourceID,
		Timestamp: time.Now(),
		Data:      data,
	}

	bytes, err := json.Marshal(p)
	if err != nil {
		return nil, "", err
	}

	// Default secret signing demo
	sig := s.SignPayload(bytes, "whsec_live_9982h38d823h823")
	return bytes, sig, nil
}

// ListWebhooks returns registered webhook endpoints.
func (s *WebhookSecurityService) ListWebhooks() []models.WebhookEndpoint {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []models.WebhookEndpoint
	for _, w := range s.webhooks {
		list = append(list, w)
	}
	return list
}
