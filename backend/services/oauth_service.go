package services

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/models"
)

type OAuthService struct {
	mu      sync.RWMutex
	clients map[string]models.OAuthClient // clientID -> OAuthClient
}

func NewOAuthService() *OAuthService {
	s := &OAuthService{
		clients: make(map[string]models.OAuthClient),
	}
	s.seedDefaultClient()
	return s
}

func (s *OAuthService) hashSecret(secret string) string {
	hash := sha256.Sum256([]byte(secret))
	return hex.EncodeToString(hash[:])
}

func (s *OAuthService) seedDefaultClient() {
	clientID := "client_netsentinel_soar"
	secret := "secret_soar_automation_2026"
	hash := s.hashSecret(secret)

	s.clients[clientID] = models.OAuthClient{
		ID:               "OAUTH-1001",
		ClientID:         clientID,
		ClientSecretHash: hash,
		Scopes:           []string{"incidents:read", "incidents:write", "soar:execute", "reports:export"},
		RedirectURLs:     []string{"http://localhost:3000/callback", "https://netsentinel.internal/callback"},
		Status:           "ACTIVE",
	}
}

// RegisterClient creates a new OAuth2 client_id and client_secret.
func (s *OAuthService) RegisterClient(scopes []string, redirectURLs []string) (string, string, models.OAuthClient) {
	b1 := make([]byte, 8)
	b2 := make([]byte, 16)
	_, _ = rand.Read(b1)
	_, _ = rand.Read(b2)

	clientID := fmt.Sprintf("client_%s", hex.EncodeToString(b1))
	clientSecret := fmt.Sprintf("secret_%s", hex.EncodeToString(b2))
	secretHash := s.hashSecret(clientSecret)

	client := models.OAuthClient{
		ID:               fmt.Sprintf("OAUTH-%d", time.Now().UnixNano()%100000),
		ClientID:         clientID,
		ClientSecretHash: secretHash,
		Scopes:           scopes,
		RedirectURLs:     redirectURLs,
		Status:           "ACTIVE",
	}

	s.mu.Lock()
	s.clients[clientID] = client
	s.mu.Unlock()

	return clientID, clientSecret, client
}

// ValidateClientCredentials verifies client_id and client_secret.
func (s *OAuthService) ValidateClientCredentials(clientID, clientSecret string) (bool, models.OAuthClient) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	client, exists := s.clients[clientID]
	if !exists || client.Status != "ACTIVE" {
		return false, models.OAuthClient{}
	}

	hash := s.hashSecret(clientSecret)
	if hash != client.ClientSecretHash {
		return false, models.OAuthClient{}
	}

	return true, client
}

// ValidateScopes checks if requested scopes are allowed for client.
func (s *OAuthService) ValidateScopes(client models.OAuthClient, requestedScopes []string) bool {
	clientScopeSet := make(map[string]bool)
	for _, sc := range client.Scopes {
		clientScopeSet[strings.TrimSpace(sc)] = true
	}

	for _, req := range requestedScopes {
		if !clientScopeSet[strings.TrimSpace(req)] {
			return false
		}
	}
	return true
}

// ListClients returns all registered OAuth2 clients.
func (s *OAuthService) ListClients() []models.OAuthClient {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []models.OAuthClient
	for _, c := range s.clients {
		list = append(list, c)
	}
	return list
}
