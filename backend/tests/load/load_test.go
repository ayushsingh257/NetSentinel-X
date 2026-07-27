package load

import (
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"netsentinel-x-backend/routes"

	"github.com/gin-gonic/gin"
)

func TestLoadConcurrency(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	routes.SetupRoutes(router)

	endpoints := []string{
		"/health",
		"/analytics",
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

	const concurrentWorkers = 50
	const requestsPerWorker = 20

	var wg sync.WaitGroup
	start := time.Now()

	for i := 0; i < concurrentWorkers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for j := 0; j < requestsPerWorker; j++ {
				endpoint := endpoints[(workerID+j)%len(endpoints)]
				req := httptest.NewRequest("GET", endpoint, nil)
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
	t.Logf("Successfully executed %d concurrent requests across 13 endpoints in %v (avg %.2f req/sec)",
		totalReqs, duration, float64(totalReqs)/duration.Seconds())
}
