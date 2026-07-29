package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWebSecurityServices(t *testing.T) {
	valService := NewInputValidationService()
	xssService := NewXSSProtectionService()
	fileService := NewFileSecurityService()

	t.Run("Test 1: XSS Input <script>alert(1)</script> -> BLOCKED", func(t *testing.T) {
		res := valService.ValidateInput("<script>alert(1)</script>")
		assert.False(t, res.IsValid)
		assert.True(t, res.Blocked)
		assert.Equal(t, "XSS", res.AttackType)

		xssRes := xssService.DetectXSS("<script>alert(1)</script>")
		assert.True(t, xssRes.Detected)
	})

	t.Run("Test 2: SQL Injection ' OR 1=1 -- -> BLOCKED", func(t *testing.T) {
		res := valService.ValidateInput("' OR 1=1 --")
		assert.False(t, res.IsValid)
		assert.True(t, res.Blocked)
		assert.Equal(t, "SQLI", res.AttackType)
	})

	t.Run("Test 4: File Upload malware.exe -> REJECTED", func(t *testing.T) {
		res := fileService.ValidateFile("malware.exe", "application/x-msdownload", 1024)
		assert.False(t, res.Allowed)
		assert.Equal(t, "CRITICAL", res.Risk)
	})

	t.Run("Test 5: Safe Input INC-2026-8001 -> ALLOWED", func(t *testing.T) {
		res := valService.ValidateInput("INC-2026-8001")
		assert.True(t, res.IsValid)
		assert.False(t, res.Blocked)
	})

	t.Run("Safe File Upload report.pdf -> ALLOWED", func(t *testing.T) {
		res := fileService.ValidateFile("incident_report.pdf", "application/pdf", 512*1024)
		assert.True(t, res.Allowed)
		assert.Equal(t, "LOW", res.Risk)
	})
}
