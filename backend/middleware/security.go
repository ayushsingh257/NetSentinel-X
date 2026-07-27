package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type RateLimiter struct {
	mu       sync.Mutex
	requests map[string][]time.Time
	limit    int
	window   time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}

	// Periodic cleanup
	go func() {
		for {
			time.Sleep(window)
			rl.mu.Lock()
			now := time.Now()
			for ip, times := range rl.requests {
				var valid []time.Time
				for _, t := range times {
					if now.Sub(t) <= window {
						valid = append(valid, t)
					}
				}
				if len(valid) == 0 {
					delete(rl.requests, ip)
				} else {
					rl.requests[ip] = valid
				}
			}
			rl.mu.Unlock()
		}
	}()

	return rl
}

func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	times := rl.requests[ip]

	var valid []time.Time
	for _, t := range times {
		if now.Sub(t) <= rl.window {
			valid = append(valid, t)
		}
	}

	if len(valid) >= rl.limit {
		return false
	}

	valid = append(valid, now)
	rl.requests[ip] = valid
	return true
}

var globalLimiter = NewRateLimiter(100, time.Minute)

func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !globalLimiter.Allow(ip) {
			c.Header("Retry-After", "60")
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":  "Rate limit exceeded. Maximum 100 requests per minute.",
				"status": 429,
				"ip":     ip,
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Next()
	}
}

func SanitizeInput(input string) string {
	s := strings.ReplaceAll(input, "<script>", "")
	s = strings.ReplaceAll(s, "</script>", "")
	s = strings.ReplaceAll(s, "javascript:", "")
	s = strings.ReplaceAll(s, "SELECT * FROM", "")
	s = strings.ReplaceAll(s, "DROP TABLE", "")
	return strings.TrimSpace(s)
}
