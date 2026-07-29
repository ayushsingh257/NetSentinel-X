package services

import (
	"os"
	"testing"
)

func TestInfrastructureSecurityService_GetPosture(t *testing.T) {
	audit := NewAuditService()
	svc := NewInfrastructureSecurityService(audit)

	posture := svc.GetPosture()
	if posture == nil {
		t.Fatal("GetPosture() returned nil")
	}
	if posture.OverallScore < 0 || posture.OverallScore > 100 {
		t.Errorf("OverallScore out of range: %d", posture.OverallScore)
	}
	if posture.Grade == "" {
		t.Error("Grade should not be empty")
	}
	if len(posture.Domains) != 5 {
		t.Errorf("Expected 5 security domains, got %d", len(posture.Domains))
	}
}

func TestInfrastructureSecurityService_HardeningChecks(t *testing.T) {
	audit := NewAuditService()
	svc := NewInfrastructureSecurityService(audit)

	posture := svc.GetPosture()
	if len(posture.HardeningChecks) == 0 {
		t.Fatal("HardeningChecks should not be empty")
	}

	// Verify all checks have required fields
	for _, c := range posture.HardeningChecks {
		if c.ID == "" {
			t.Error("HardeningCheck missing ID")
		}
		if c.Status == "" {
			t.Error("HardeningCheck missing Status")
		}
		if c.Control == "" {
			t.Error("HardeningCheck missing Control name")
		}
	}
}

func TestInfrastructureSecurityService_DockerChecks(t *testing.T) {
	audit := NewAuditService()
	svc := NewInfrastructureSecurityService(audit)

	posture := svc.GetPosture()
	if len(posture.DockerChecks) == 0 {
		t.Fatal("DockerChecks should not be empty")
	}

	passCount := 0
	for _, c := range posture.DockerChecks {
		if c.Status == "pass" {
			passCount++
		}
		if c.Check == "" {
			t.Error("DockerCheck missing Check name")
		}
	}
	// At least majority of Docker checks should pass (we built hardened Dockerfiles)
	if passCount < 7 {
		t.Errorf("Expected at least 7 Docker checks to pass, got %d", passCount)
	}
}

func TestInfrastructureSecurityService_NetworkSegmentation(t *testing.T) {
	audit := NewAuditService()
	svc := NewInfrastructureSecurityService(audit)

	posture := svc.GetPosture()
	if len(posture.NetworkControls) == 0 {
		t.Fatal("NetworkControls should not be empty")
	}

	for _, n := range posture.NetworkControls {
		if n.Zone == "" {
			t.Error("NetworkSegmentControl missing Zone")
		}
		// Database layer must NOT be accessible from internet
		if n.Zone == "Data Layer" && n.Accessible {
			t.Error("SECURITY VIOLATION: Data Layer must not be accessible from internet")
		}
		if n.Zone == "Application Layer" && n.Accessible {
			t.Error("SECURITY VIOLATION: Application Layer must not be directly accessible from internet")
		}
	}
}

func TestInfrastructureSecurityService_TLSChecks(t *testing.T) {
	audit := NewAuditService()
	svc := NewInfrastructureSecurityService(audit)

	posture := svc.GetPosture()
	if len(posture.TLSControls) == 0 {
		t.Fatal("TLSControls should not be empty")
	}

	compliantCount := 0
	for _, t2 := range posture.TLSControls {
		if t2.Compliant {
			compliantCount++
		}
	}
	if compliantCount < 4 {
		t.Errorf("Expected at least 4 TLS controls compliant, got %d", compliantCount)
	}
}

func TestInfrastructureSecurityService_WeakJWTSecret(t *testing.T) {
	// Set a weak JWT secret and verify it's detected
	os.Setenv("JWT_SECRET", "weak")
	defer os.Unsetenv("JWT_SECRET")

	audit := NewAuditService()
	svc := NewInfrastructureSecurityService(audit)

	posture := svc.GetPosture()
	jwtCheckFailed := false
	for _, c := range posture.HardeningChecks {
		if c.ID == "SRV-002" && c.Status == "fail" {
			jwtCheckFailed = true
		}
	}
	if !jwtCheckFailed {
		t.Error("Expected SRV-002 (JWT_SECRET Strength) to fail with weak secret")
	}
}

func TestInfrastructureSecurityService_StrongJWTSecret(t *testing.T) {
	// Set a strong JWT secret and verify it passes
	os.Setenv("JWT_SECRET", "a-very-strong-jwt-secret-that-is-definitely-longer-than-32-chars")
	defer os.Unsetenv("JWT_SECRET")

	audit := NewAuditService()
	svc := NewInfrastructureSecurityService(audit)

	posture := svc.GetPosture()
	jwtCheckPassed := false
	for _, c := range posture.HardeningChecks {
		if c.ID == "SRV-002" && c.Status == "pass" {
			jwtCheckPassed = true
		}
	}
	if !jwtCheckPassed {
		t.Error("Expected SRV-002 (JWT_SECRET Strength) to pass with strong secret")
	}
}

func TestInfrastructureSecurityService_WildcardCORSDetected(t *testing.T) {
	os.Setenv("ALLOWED_ORIGINS", "*")
	defer os.Unsetenv("ALLOWED_ORIGINS")

	audit := NewAuditService()
	svc := NewInfrastructureSecurityService(audit)

	posture := svc.GetPosture()
	corsCheckFailed := false
	for _, c := range posture.HardeningChecks {
		if c.ID == "SRV-004" && c.Status == "fail" {
			corsCheckFailed = true
		}
	}
	if !corsCheckFailed {
		t.Error("Expected SRV-004 (CORS) to fail with wildcard ALLOWED_ORIGINS")
	}
}

func TestScoreToGrade(t *testing.T) {
	cases := []struct {
		score    int
		expected string
	}{
		{98, "A+"},
		{92, "A"},
		{85, "B"},
		{72, "C"},
		{65, "D"},
		{40, "F"},
	}
	for _, tc := range cases {
		got := scoreToGrade(tc.score)
		if got != tc.expected {
			t.Errorf("scoreToGrade(%d) = %s, want %s", tc.score, got, tc.expected)
		}
	}
}

func TestCheckStatusFromScore(t *testing.T) {
	if checkStatusFromScore(95) != "secure" {
		t.Error("Expected 'secure' for score 95")
	}
	if checkStatusFromScore(70) != "warning" {
		t.Error("Expected 'warning' for score 70")
	}
	if checkStatusFromScore(40) != "critical" {
		t.Error("Expected 'critical' for score 40")
	}
}

func TestInfrastructureSecurityService_DomainWeightsSum(t *testing.T) {
	audit := NewAuditService()
	svc := NewInfrastructureSecurityService(audit)
	posture := svc.GetPosture()

	totalWeight := 0.0
	for _, d := range posture.Domains {
		totalWeight += d.Weight
	}
	// Weights should sum to ~1.0
	if totalWeight < 0.99 || totalWeight > 1.01 {
		t.Errorf("Domain weights should sum to 1.0, got %.2f", totalWeight)
	}
}

func TestInfrastructureSecurityService_ProductionReadiness(t *testing.T) {
	// Set a strong JWT secret so the score is not dragged down by a critical failure
	os.Setenv("JWT_SECRET", "prod-secret-that-is-definitely-at-least-32-characters-long")
	defer os.Unsetenv("JWT_SECRET")

	audit := NewAuditService()
	svc := NewInfrastructureSecurityService(audit)

	posture := svc.GetPosture()
	// ProductionReady is true when score >= 85 AND 0 critical issues
	// With a strong JWT secret, critical count should be 0
	if posture.CriticalIssues > 0 && posture.ProductionReady {
		t.Error("ProductionReady must be false when there are critical issues")
	}
}
