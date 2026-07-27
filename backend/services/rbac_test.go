package services

import (
	"netsentinel-x-backend/models"
	"testing"
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
		if len(perms) != 1 {
			t.Fatalf("Expected 1 permission for ViewOnly, got %d", len(perms))
		}
		if perms[0] != models.PermViewIncidents {
			t.Errorf("Expected PermViewIncidents, got %s", perms[0])
		}
	})
}
