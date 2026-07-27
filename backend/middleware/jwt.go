package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// JWTSecretKey is the HS256 signing key.
// In Era 19 (Infrastructure Security) this will be moved to an environment variable + Vault.
const JWTSecretKey = "netsentinel-x-dev-secret-key-2026-enterprise"

// NetSentinelClaims defines the JWT payload for all platform tokens.
type NetSentinelClaims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken creates a signed HS256 JWT valid for 24 hours.
func GenerateToken(userID, username, role string) (string, time.Time, error) {
	expiry := time.Now().Add(24 * time.Hour)
	claims := NetSentinelClaims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(expiry),
			Issuer:    "netsentinel-x",
			Audience:  []string{"netsentinel-x-frontend"},
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(JWTSecretKey))
	return signed, expiry, err
}

// ParseToken validates a JWT string and returns the claims.
func ParseToken(tokenString string) (*NetSentinelClaims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&NetSentinelClaims{},
		func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(JWTSecretKey), nil
		},
		jwt.WithExpirationRequired(),
		jwt.WithIssuer("netsentinel-x"),
	)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*NetSentinelClaims)
	if !ok || !token.Valid {
		return nil, jwt.ErrTokenInvalidClaims
	}
	return claims, nil
}

// AuthMiddleware validates the JWT Bearer token on every protected request.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header missing",
				"code":  "AUTH_HEADER_MISSING",
			})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid Authorization header format. Expected: Bearer <token>",
				"code":  "AUTH_HEADER_INVALID",
			})
			c.Abort()
			return
		}

		claims, err := ParseToken(parts[1])
		if err != nil {
			code := "AUTH_TOKEN_INVALID"
			msg := "Invalid or malformed token"
			if strings.Contains(err.Error(), "expired") {
				code = "AUTH_TOKEN_EXPIRED"
				msg = "Token has expired. Please log in again."
			} else if strings.Contains(err.Error(), "signature") {
				code = "AUTH_TOKEN_TAMPERED"
				msg = "Token signature verification failed."
			}
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": msg,
				"code":  code,
			})
			c.Abort()
			return
		}

		// Inject verified claims into request context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}
