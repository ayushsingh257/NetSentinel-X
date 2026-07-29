package load

import (
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"netsentinel-x-backend/middleware"
	"netsentinel-x-backend/routes"

	"github.com/gin-gonic/gin"
)

// generateLoadTestToken creates a valid signed JWT for use in load tests.
// This is necessary because /api/v2/* routes now require authentication.
func generateLoadTestToken(t *testing.T) string {
	t.Helper()
	token, _, err := middleware.GenerateToken("usr-load-test", "loadtest", "analyst")
	if err != nil {
		t.Fatalf("Failed to generate load test token: %v", err)
	}
	return "Bearer " + token
}

func TestLoadConcurrency(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	routes.SetupRoutes(router)

	authHeader := generateLoadTestToken(t)

	// Public endpoints (no auth required)
	publicEndpoints := []string{
		"/health",
		"/analytics",
	}

	// Protected endpoints (require valid JWT — Era 17 security hardening)
	protectedEndpoints := []string{
		"/api/v2/copilot/prompts",
		"/api/v2/mitre/matrix",
		"/api/v2/intelligence",
		"/api/v2/ueba",
		"/api/v2/optimizer",
		"/api/v2/incidents",
		"/api/v2/attack-graph",
		"/api/v2/workflows",
		"/api/v2/health",
		"/api/v2/security/posture",
		"/api/v2/demo/scenarios",
	}

	allEndpoints := append(publicEndpoints, protectedEndpoints...)

	const concurrentWorkers = 50
	const requestsPerWorker = 20

	var wg sync.WaitGroup
	start := time.Now()

	for i := 0; i < concurrentWorkers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for j := 0; j < requestsPerWorker; j++ {
				endpoint := allEndpoints[(workerID+j)%len(allEndpoints)]
				req := httptest.NewRequest("GET", endpoint, nil)
				req.Header.Set("X-RateLimit-Bypass", "true")

				// Attach auth header for protected endpoints
				for _, pe := range protectedEndpoints {
					if endpoint == pe {
						req.Header.Set("Authorization", authHeader)
						break
					}
				}

				resp := httptest.NewRecorder()
				router.ServeHTTP(resp, req)

				if resp.Code != http.StatusOK {
					t.Errorf("Worker %d failed on endpoint %s: status %d", workerID, endpoint, resp.Code)
				}
			}
		}(i)
	}

	wg.Wait()
	duration := time.Since(start)

	totalReqs := concurrentWorkers * requestsPerWorker
	t.Logf("Successfully executed %d concurrent authenticated requests across %d endpoints in %v (avg %.2f req/sec)",
		totalReqs, len(allEndpoints), duration, float64(totalReqs)/duration.Seconds())
}

// TestUnauthenticatedRequestsRejected validates that protected endpoints
// reject requests without a valid JWT — this is a security regression test.
func TestUnauthenticatedRequestsRejected(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	routes.SetupRoutes(router)

	protectedEndpoints := []string{
		"/api/v2/copilot/prompts",
		"/api/v2/mitre/matrix",
		"/api/v2/incidents",
		"/api/v2/security/posture",
	}

	for _, endpoint := range protectedEndpoints {
		req := httptest.NewRequest("GET", endpoint, nil)
		// No Authorization header
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusUnauthorized {
			t.Errorf("Expected 401 for unauthenticated request to %s, got %d", endpoint, resp.Code)
		}
	}

	t.Log("Security validation: All protected endpoints correctly rejected unauthenticated requests")
}
