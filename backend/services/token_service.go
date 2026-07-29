package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// NetSentinelClaims holds custom JWT claims for NetSentinel-X V2.
type NetSentinelClaims struct {
	UserID      string   `json:"user_id"`
	Username    string   `json:"username"`
	Role        string   `json:"role"`
	TokenType   string   `json:"token_type"` // "access" or "refresh"
	SessionID   string   `json:"session_id"`
	Permissions []string `json:"permissions"`
	jwt.RegisteredClaims
}

// TokenService manages short-lived access tokens (15-min expiry).
type TokenService struct {
	secretKey []byte
}

// NewTokenService creates a new TokenService instance.
func NewTokenService() *TokenService {
	return &TokenService{
		secretKey: []byte("netsentinel_v2_era24_jwt_secret_key_32b!"),
	}
}

// GenerateAccessToken creates a short-lived 15-minute JWT access token.
func (s *TokenService) GenerateAccessToken(userID, username, role, sessionID string, permissions []string) (string, time.Time, error) {
	expiry := time.Now().Add(15 * time.Minute)

	claims := NetSentinelClaims{
		UserID:      userID,
		Username:    username,
		Role:        role,
		TokenType:   "access",
		SessionID:   sessionID,
		Permissions: permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiry),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "netsentinel-x",
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiry, nil
}

// ValidateAccessToken parses and validates a 15-minute JWT access token.
func (s *TokenService) ValidateAccessToken(tokenStr string) (*NetSentinelClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &NetSentinelClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*NetSentinelClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid or expired token claims")
	}

	if claims.TokenType != "access" {
		return nil, errors.New("invalid_token_type: expected access token")
	}

	return claims, nil
}
