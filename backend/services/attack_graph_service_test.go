package services

import (
	"testing"
)

func TestAttackGraphService(t *testing.T) {
	service := NewAttackGraphService()

	t.Run("GetGraphPayload Structure", func(t *testing.T) {
		payload := service.GetGraphPayload()
		if payload.TotalNodes < 6 {
			t.Fatalf("Expected at least 6 nodes, got %d", payload.TotalNodes)
		}
		if payload.TotalEdges < 5 {
			t.Fatalf("Expected at least 5 edges, got %d", payload.TotalEdges)
		}
		if len(payload.CriticalPaths) < 1 {
			t.Fatal("Expected at least 1 critical path")
		}
	})

	t.Run("GetNodes List", func(t *testing.T) {
		nodes := service.GetNodes()
		if len(nodes) < 6 {
			t.Errorf("Expected nodes count >= 6, got %d", len(nodes))
		}
	})

	t.Run("GetEdges List", func(t *testing.T) {
		edges := service.GetEdges()
		if len(edges) < 5 {
			t.Errorf("Expected edges count >= 5, got %d", len(edges))
		}
	})

	t.Run("GetPathByID Valid", func(t *testing.T) {
		path, exists := service.GetPathByID("PATH-2026-001")
		if !exists {
			t.Fatal("Expected PATH-2026-001 to exist")
		}
		if path.Severity != "CRITICAL" {
			t.Errorf("Expected severity CRITICAL, got %s", path.Severity)
		}
	})

	t.Run("ExplainPath Output", func(t *testing.T) {
		exp, p := service.ExplainPath("PATH-2026-001")
		if len(exp) < 50 {
			t.Error("Expected explanation string payload")
		}
		if p.ID != "PATH-2026-001" {
			t.Errorf("Expected Path ID PATH-2026-001, got %s", p.ID)
		}
	})
}
