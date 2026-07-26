package services

import (
	"netsentinel-x-backend/models"
	"testing"
)

func TestWorkflowService(t *testing.T) {
	service := NewWorkflowService()

	t.Run("GetWorkflows Returns Seed Workflows", func(t *testing.T) {
		workflows := service.GetWorkflows()
		if len(workflows) < 2 {
			t.Fatalf("Expected at least 2 seed workflows, got %d", len(workflows))
		}
	})

	t.Run("GetWorkflowByID Valid ID", func(t *testing.T) {
		wf, exists := service.GetWorkflowByID("WF-001")
		if !exists {
			t.Fatal("Expected workflow WF-001 to exist")
		}
		if wf.Name == "" {
			t.Error("Expected non-empty workflow name")
		}
	})

	t.Run("CreateWorkflow Adds New Workflow", func(t *testing.T) {
		newWf := models.Workflow{
			Name:        "Test Ransomware Containment",
			Description: "Test description",
			Category:    "RANSOMWARE",
		}
		created := service.CreateWorkflow(newWf)
		if created.ID == "" {
			t.Error("Expected non-empty ID for created workflow")
		}
	})

	t.Run("ExecuteWorkflow Triggers Run", func(t *testing.T) {
		exec, err := service.ExecuteWorkflow("WF-001")
		if err != nil {
			t.Fatalf("ExecuteWorkflow failed: %v", err)
		}
		if exec.Status != "COMPLETED" {
			t.Errorf("Expected status COMPLETED, got %s", exec.Status)
		}
	})

	t.Run("GetApprovals Returns Pending Approval", func(t *testing.T) {
		apps := service.GetApprovals()
		if len(apps) < 1 {
			t.Fatal("Expected at least 1 pending approval")
		}
	})

	t.Run("DecideApproval Approves Item", func(t *testing.T) {
		app, ok := service.DecideApproval("APP-101", true)
		if !ok {
			t.Fatal("Expected approval APP-101 to exist")
		}
		if app.Status != "APPROVED" {
			t.Errorf("Expected status APPROVED, got %s", app.Status)
		}
	})

	t.Run("GenerateAIPlaybook Returns Valid Playbook", func(t *testing.T) {
		pb := service.GenerateAIPlaybook("MALWARE")
		if pb.Category != "MALWARE" {
			t.Errorf("Expected category MALWARE, got %s", pb.Category)
		}
		if len(pb.Steps) < 2 {
			t.Error("Expected at least 2 steps in AI playbook")
		}
	})
}
