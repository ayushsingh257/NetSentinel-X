package models

type OAuthClient struct {
	ID               string   `json:"id"`
	ClientID         string   `json:"client_id"`
	ClientSecretHash string   `json:"-"`
	Scopes           []string `json:"scopes"`
	RedirectURLs     []string `json:"redirect_urls"`
	Status           string   `json:"status"` // ACTIVE, REVOKED
}
