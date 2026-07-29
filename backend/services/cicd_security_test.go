package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCICDSecuritySuite(t *testing.T) {
	cicdService := NewCICDSecurityService()

	// Test 1: SAST vulnerability detection -> VULNERABILITY_FOUND
	t.Run("Test 1: SAST vulnerability detection", func(t *testing.T) {
		unsafeSQLSnippet := "query := fmt.Sprintf(\"SELECT * FROM users WHERE id = '%s'\", userInput)"
		detected, status := cicdService.EvaluateSAST(unsafeSQLSnippet)

		assert.True(t, detected, "SAST engine must flag string-formatted SQL queries")
		assert.Equal(t, "VULNERABILITY_FOUND", status)

		safeSQLSnippet := "db.QueryRowContext(ctx, \"SELECT * FROM users WHERE id = $1\", userID)"
		detectedSafe, statusSafe := cicdService.EvaluateSAST(safeSQLSnippet)
		assert.False(t, detectedSafe)
		assert.Equal(t, "PASSED", statusSafe)
	})

	// Test 2: Secret detection -> SECRET_DETECTED
	t.Run("Test 2: Secret detection", func(t *testing.T) {
		exposedContent := "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
		detected, status := cicdService.EvaluateSecret(exposedContent)

		assert.True(t, detected, "Secret scanner must detect exposed AWS AKIA keys")
		assert.Equal(t, "SECRET_DETECTED", status)
	})

	// Test 3: Dependency CVE -> HIGH_RISK_DEPENDENCY
	t.Run("Test 3: Dependency CVE", func(t *testing.T) {
		detected, status := cicdService.EvaluateDependencyCVE("vulnerable-lib", "1.0.0")

		assert.True(t, detected, "Dependency vulnerability scanner must flag high risk packages")
		assert.Equal(t, "HIGH_RISK_DEPENDENCY", status)
	})

	// Test 4: Container scan -> DEPLOYMENT_BLOCKED
	t.Run("Test 4: Container scan", func(t *testing.T) {
		detected, status := cicdService.EvaluateContainerScan("netsentinel-backend:latest", 2)

		assert.True(t, detected, "Trivy container scan with critical CVEs must block deployment")
		assert.Equal(t, "DEPLOYMENT_BLOCKED", status)
	})

	// Test 5: SBOM generation -> SBOM_CREATED
	t.Run("Test 5: SBOM generation", func(t *testing.T) {
		sbom := cicdService.GetSBOM()

		assert.GreaterOrEqual(t, len(sbom), 4, "Software Bill of Materials inventory must be generated")
		assert.Equal(t, "github.com/gin-gonic/gin", sbom[0].Name)
		assert.Equal(t, "MIT", sbom[0].License)
		assert.NotEmpty(t, sbom[0].Hash)

		posture := cicdService.GetPosture()
		assert.Equal(t, 98, posture.SecurityScore)
		assert.Equal(t, "DEPLOYMENT_ALLOWED", posture.GateOutcome)
	})
}
