package services

import (
	"testing"

	"netsentinel-x-backend/models"
)

func TestRBAC(t *testing.T) {
	t.Run("SuperAdmin Has All Permissions", func(t *testing.T) {
		perms := models.RolePermissionsMap[models.RoleSuperAdmin]
		if len(perms) < 10 {
			t.Fatalf("Expected at least 10 permissions for SuperAdmin, got %d", len(perms))
		}
	})

	t.Run("ViewOnly Has Restricted Permissions", func(t *testing.T) {
		perms := models.RolePermissionsMap[models.RoleViewOnly]
		if len(perms) != 3 {
			t.Fatalf("Expected 3 permissions for ViewOnly, got %d", len(perms))
		}
		hasViewIncidents := false
		for _, p := range perms {
			if p == models.PermViewIncidents {
				hasViewIncidents = true
			}
		}
		if !hasViewIncidents {
			t.Errorf("Expected PermViewIncidents in ViewOnly permissions")
		}
	})
}
