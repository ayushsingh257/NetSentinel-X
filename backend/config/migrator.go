package config

import (
	"database/sql"
	"fmt"
	"log"
	"sort"
	"strconv"
	"strings"
	"time"

	"netsentinel-x-backend/migrations"
)

// Migration represents a single versioned migration script.
type Migration struct {
	Version int64
	Name    string
	UpSQL   string
	DownSQL string
}

// MigrationRecord represents a recorded migration state in the database.
type MigrationRecord struct {
	Version   int64     `json:"version"`
	Dirty     bool      `json:"dirty"`
	AppliedAt time.Time `json:"applied_at"`
}

// EnsureSchemaMigrationsTable initializes the migration tracking table if not present.
func EnsureSchemaMigrationsTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS schema_migrations (
		version BIGINT PRIMARY KEY,
		dirty BOOLEAN NOT NULL DEFAULT FALSE,
		applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create schema_migrations table: %w", err)
	}
	return nil
}

// LoadEmbeddedMigrations parses all embedded SQL migration files.
func LoadEmbeddedMigrations() ([]Migration, error) {
	entries, err := migrations.FS.ReadDir(".")
	if err != nil {
		return nil, fmt.Errorf("failed to read embedded migrations directory: %w", err)
	}

	migrationsMap := make(map[int64]*Migration)

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}

		parts := strings.Split(entry.Name(), "_")
		if len(parts) < 2 {
			continue
		}

		version, err := strconv.ParseInt(parts[0], 10, 64)
		if err != nil {
			continue
		}

		content, err := migrations.FS.ReadFile(entry.Name())
		if err != nil {
			return nil, fmt.Errorf("failed to read migration file %s: %w", entry.Name(), err)
		}

		if _, exists := migrationsMap[version]; !exists {
			migrationsMap[version] = &Migration{
				Version: version,
				Name:    entry.Name(),
			}
		}

		if strings.HasSuffix(entry.Name(), ".up.sql") {
			migrationsMap[version].UpSQL = string(content)
		} else if strings.HasSuffix(entry.Name(), ".down.sql") {
			migrationsMap[version].DownSQL = string(content)
		}
	}

	var result []Migration
	for _, m := range migrationsMap {
		result = append(result, *m)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Version < result[j].Version
	})

	return result, nil
}

// GetAppliedMigrations returns a map of already applied migration versions.
func GetAppliedMigrations(db *sql.DB) (map[int64]MigrationRecord, error) {
	if err := EnsureSchemaMigrationsTable(db); err != nil {
		return nil, err
	}

	rows, err := db.Query("SELECT version, dirty, applied_at FROM schema_migrations ORDER BY version ASC")
	if err != nil {
		return nil, fmt.Errorf("failed to query schema_migrations: %w", err)
	}
	defer rows.Close()

	applied := make(map[int64]MigrationRecord)
	for rows.Next() {
		var rec MigrationRecord
		if err := rows.Scan(&rec.Version, &rec.Dirty, &rec.AppliedAt); err != nil {
			return nil, fmt.Errorf("failed to scan migration row: %w", err)
		}
		applied[rec.Version] = rec
	}

	return applied, nil
}

// RunMigrations applies all pending version-controlled migrations deterministically.
func RunMigrations(db *sql.DB) error {
	if err := EnsureSchemaMigrationsTable(db); err != nil {
		return err
	}

	allMigrations, err := LoadEmbeddedMigrations()
	if err != nil {
		return err
	}

	applied, err := GetAppliedMigrations(db)
	if err != nil {
		return err
	}

	appliedCount := 0
	for _, m := range allMigrations {
		if rec, ok := applied[m.Version]; ok {
			if rec.Dirty {
				return fmt.Errorf("migration version %d is in a dirty state; manual intervention required", m.Version)
			}
			continue // Already applied cleanly
		}

		log.Printf("[MIGRATION] Applying migration version %06d (%s)...", m.Version, m.Name)

		tx, err := db.Begin()
		if err != nil {
			return fmt.Errorf("failed to begin transaction for migration %d: %w", m.Version, err)
		}

		// Mark as dirty during execution
		_, err = tx.Exec("INSERT INTO schema_migrations (version, dirty, applied_at) VALUES ($1, true, NOW())", m.Version)
		if err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("failed to record dirty migration state for version %d: %w", m.Version, err)
		}

		// Execute Up migration SQL
		if _, err := tx.Exec(m.UpSQL); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("failed to execute up SQL for migration version %d: %w", m.Version, err)
		}

		// Clear dirty flag
		_, err = tx.Exec("UPDATE schema_migrations SET dirty = false WHERE version = $1", m.Version)
		if err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("failed to finalize clean migration state for version %d: %w", m.Version, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit migration transaction for version %d: %w", m.Version, err)
		}

		log.Printf("[MIGRATION] Successfully applied migration version %06d", m.Version)
		appliedCount++
	}

	if appliedCount == 0 {
		log.Println("[MIGRATION] Schema is up to date (no pending migrations).")
	} else {
		log.Printf("[MIGRATION] Applied %d migration(s) successfully.", appliedCount)
	}

	return nil
}

// RollbackMigration reverts the most recent migration version.
func RollbackMigration(db *sql.DB) error {
	if err := EnsureSchemaMigrationsTable(db); err != nil {
		return err
	}

	allMigrations, err := LoadEmbeddedMigrations()
	if err != nil {
		return err
	}

	applied, err := GetAppliedMigrations(db)
	if err != nil {
		return err
	}

	if len(applied) == 0 {
		log.Println("[MIGRATION] No migrations to roll back.")
		return nil
	}

	// Find highest applied version
	var highestVersion int64 = -1
	for v := range applied {
		if v > highestVersion {
			highestVersion = v
		}
	}

	var targetMigration *Migration
	for _, m := range allMigrations {
		if m.Version == highestVersion {
			targetMigration = &m
			break
		}
	}

	if targetMigration == nil || targetMigration.DownSQL == "" {
		return fmt.Errorf("down SQL script not found for version %d", highestVersion)
	}

	log.Printf("[MIGRATION] Rolling back migration version %06d...", highestVersion)

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin rollback transaction: %w", err)
	}

	if _, err := tx.Exec(targetMigration.DownSQL); err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("failed to execute rollback SQL: %w", err)
	}

	if _, err := tx.Exec("DELETE FROM schema_migrations WHERE version = $1", highestVersion); err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("failed to remove migration record: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit rollback transaction: %w", err)
	}

	log.Printf("[MIGRATION] Successfully rolled back migration version %06d", highestVersion)
	return nil
}

// VerifySchemaCompatibility checks whether the required database tables exist in the public schema.
func VerifySchemaCompatibility(db *sql.DB) error {
	requiredTables := []string{"traffic_logs", "alerts"}

	for _, table := range requiredTables {
		var exists bool
		query := `
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = $1
		);
		`
		err := db.QueryRow(query, table).Scan(&exists)
		if err != nil {
			return fmt.Errorf("failed to verify table existence for '%s': %w", table, err)
		}
		if !exists {
			return fmt.Errorf("required database table '%s' does not exist in schema (run migrations to initialize)", table)
		}
	}

	log.Println("[DATABASE] Schema compatibility check PASSED: all required tables verified.")
	return nil
}

// AutoMigrateIfEnabled inspects the AUTO_MIGRATE environment variable.
// In development/test environments (AUTO_MIGRATE=true), it executes pending migrations.
// In production environments (AUTO_MIGRATE=false or unset), it validates schema compatibility only.
func AutoMigrateIfEnabled(db *sql.DB) {
	if db == nil {
		return
	}

	autoMigrate := strings.EqualFold(GetEnv("AUTO_MIGRATE"), "true")

	if autoMigrate {
		log.Println("[MIGRATION] AUTO_MIGRATE=true detected: executing pending migrations...")
		if err := RunMigrations(db); err != nil {
			log.Printf("[MIGRATION] Auto-migration warning: %v", err)
		}
	} else {
		log.Println("[MIGRATION] Production mode: verifying database schema compatibility...")
		if err := VerifySchemaCompatibility(db); err != nil {
			log.Printf("[DATABASE] Schema verification note: %v", err)
		}
	}
}
