package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"os"

	"netsentinel-x-backend/config"

	_ "github.com/lib/pq"
)

func main() {
	config.LoadEnv()

	upCmd := flag.Bool("up", false, "Apply all pending migrations")
	downCmd := flag.Bool("down", false, "Roll back the most recent migration")
	statusCmd := flag.Bool("status", false, "Display current migration status")
	verifyCmd := flag.Bool("verify", false, "Verify database schema compatibility without modifying schema")

	flag.Parse()

	connStr, maskedStr, mode := config.ResolveDatabaseConnection()
	log.Printf("Connecting to %s (%s)...", mode, maskedStr)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Database driver initialization failed: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if *downCmd {
		log.Println("Executing rollback migration...")
		if err := config.RollbackMigration(db); err != nil {
			log.Fatalf("Rollback failed: %v", err)
		}
		log.Println("Rollback completed successfully.")
		return
	}

	if *statusCmd {
		applied, err := config.GetAppliedMigrations(db)
		if err != nil {
			log.Fatalf("Failed to retrieve migration status: %v", err)
		}

		embedded, err := config.LoadEmbeddedMigrations()
		if err != nil {
			log.Fatalf("Failed to load embedded migrations: %v", err)
		}

		fmt.Println("\n=== NetSentinel-X Supabase Migration Status ===")
		fmt.Printf("%-10s %-35s %-10s %-25s\n", "VERSION", "MIGRATION NAME", "STATUS", "APPLIED AT")
		fmt.Println(string(make([]byte, 85)))

		for _, m := range embedded {
			status := "PENDING"
			appliedAt := "-"
			if rec, ok := applied[m.Version]; ok {
				if rec.Dirty {
					status = "DIRTY"
				} else {
					status = "APPLIED"
				}
				appliedAt = rec.AppliedAt.Format("2006-01-02 15:04:05 MST")
			}
			fmt.Printf("%06d     %-35s %-10s %-25s\n", m.Version, m.Name, status, appliedAt)
		}
		fmt.Println()
		return
	}

	if *verifyCmd {
		log.Println("Verifying database schema compatibility...")
		if err := config.VerifySchemaCompatibility(db); err != nil {
			log.Fatalf("Schema verification failed: %v", err)
		}
		log.Println("Schema verification passed.")
		return
	}

	// Default action or explicit --up
	if *upCmd || len(os.Args) == 1 {
		log.Println("Executing up migrations...")
		if err := config.RunMigrations(db); err != nil {
			log.Fatalf("Migration execution failed: %v", err)
		}
		log.Println("Migrations executed successfully.")
		return
	}
}
