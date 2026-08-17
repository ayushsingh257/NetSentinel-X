package config

import (
	"database/sql"
	"fmt"
	"log"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

var (
	DB           *sql.DB
	urlPassRegex = regexp.MustCompile(`://([^:]+):([^@]+)@`)
)

// ResolveDatabaseConnection determines the appropriate connection string and mode for Supabase / PostgreSQL.
// Prioritizes SUPABASE_DATABASE_URL / DATABASE_URL, with fallback to discrete SUPABASE_DB_* / DB_* variables.
func ResolveDatabaseConnection() (connStr string, maskedStr string, mode string) {
	rawURL := GetEnv("SUPABASE_DATABASE_URL")
	if rawURL == "" {
		rawURL = GetEnv("DATABASE_URL")
	}

	if rawURL != "" {
		parsed, err := url.Parse(rawURL)
		if err == nil && parsed.Host != "" {
			host := parsed.Host

			if strings.Contains(host, "pooler.supabase.com") {
				if parsed.Port() == "6543" {
					mode = "Supabase Transaction Pooler (Port 6543)"
				} else {
					mode = "Supabase Session Pooler (Port 5432)"
				}
			} else if strings.Contains(host, "supabase.co") {
				mode = "Supabase Direct Connection (Port 5432)"
			} else {
				mode = "Standard PostgreSQL"
			}

			masked := urlPassRegex.ReplaceAllString(rawURL, "://${1}:********@")
			return rawURL, masked, mode
		}
		return rawURL, "[custom-connection-string]", "Custom PostgreSQL"
	}

	// Discrete parameter resolution
	host := GetEnv("SUPABASE_DB_HOST")
	if host == "" {
		host = GetEnv("DB_HOST")
	}
	if host == "" {
		host = "localhost"
	}

	port := GetEnv("SUPABASE_DB_PORT")
	if port == "" {
		port = GetEnv("DB_PORT")
	}
	if port == "" {
		port = "5432"
	}

	user := GetEnv("SUPABASE_DB_USER")
	if user == "" {
		user = GetEnv("DB_USER")
	}
	if user == "" {
		user = "postgres"
	}

	password := GetEnv("SUPABASE_DB_PASSWORD")
	if password == "" {
		password = GetEnv("DB_PASSWORD")
	}

	dbname := GetEnv("SUPABASE_DB_NAME")
	if dbname == "" {
		dbname = GetEnv("DB_NAME")
	}
	if dbname == "" {
		dbname = "postgres"
	}

	sslmode := GetEnv("SUPABASE_DB_SSLMODE")
	if sslmode == "" {
		sslmode = GetEnv("DB_SSLMODE")
	}
	if sslmode == "" {
		if strings.Contains(host, "supabase.co") || strings.Contains(host, "pooler.supabase.com") {
			sslmode = "require"
		} else {
			sslmode = "disable"
		}
	}

	if strings.Contains(host, "pooler.supabase.com") {
		if port == "6543" {
			mode = "Supabase Transaction Pooler (Port 6543)"
		} else {
			mode = "Supabase Session Pooler (Port 5432)"
		}
	} else if strings.Contains(host, "supabase.co") {
		mode = "Supabase Direct Connection (Port 5432)"
	} else if host == "localhost" || host == "127.0.0.1" || host == "postgres" {
		mode = "Local/Container PostgreSQL"
	} else {
		mode = "Remote PostgreSQL"
	}

	connStr = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host,
		port,
		user,
		password,
		dbname,
		sslmode,
	)

	maskedStr = fmt.Sprintf(
		"host=%s port=%s user=%s password=******** dbname=%s sslmode=%s",
		host,
		port,
		user,
		dbname,
		sslmode,
	)

	return connStr, maskedStr, mode
}

// configureConnectionPool sets optimal connection pool limits for a persistent Go server.
func configureConnectionPool(db *sql.DB) {
	maxOpen := 25
	if envVal := os.Getenv("DB_MAX_OPEN_CONNS"); envVal != "" {
		if parsed, err := strconv.Atoi(envVal); err == nil && parsed > 0 {
			maxOpen = parsed
		}
	}

	maxIdle := 10
	if envVal := os.Getenv("DB_MAX_IDLE_CONNS"); envVal != "" {
		if parsed, err := strconv.Atoi(envVal); err == nil && parsed > 0 {
			maxIdle = parsed
		}
	}

	connMaxLifetime := 5 * time.Minute
	if envVal := os.Getenv("DB_CONN_MAX_LIFETIME"); envVal != "" {
		if parsed, err := time.ParseDuration(envVal); err == nil {
			connMaxLifetime = parsed
		}
	}

	connMaxIdleTime := 2 * time.Minute
	if envVal := os.Getenv("DB_CONN_MAX_IDLE_TIME"); envVal != "" {
		if parsed, err := time.ParseDuration(envVal); err == nil {
			connMaxIdleTime = parsed
		}
	}

	db.SetMaxOpenConns(maxOpen)
	db.SetMaxIdleConns(maxIdle)
	db.SetConnMaxLifetime(connMaxLifetime)
	db.SetConnMaxIdleTime(connMaxIdleTime)

	log.Printf("[DATABASE] Connection pool configured: max_open=%d, max_idle=%d, max_lifetime=%v, max_idletime=%v",
		maxOpen, maxIdle, connMaxLifetime, connMaxIdleTime)
}

// ConnectDatabase establishes a managed PostgreSQL connection with retry backoff and connection pooling.
func ConnectDatabase() {
	connStr, maskedStr, mode := ResolveDatabaseConnection()

	log.Printf("[DATABASE] Initializing database connection via %s...", mode)
	log.Printf("[DATABASE] Connection target: %s", maskedStr)

	var err error
	maxRetries := 4

	for i := 1; i <= maxRetries; i++ {
		DB, err = sql.Open("postgres", connStr)
		if err == nil {
			err = DB.Ping()
			if err == nil {
				log.Printf("[DATABASE] Successfully connected to PostgreSQL (%s)", mode)
				configureConnectionPool(DB)
				AutoMigrateIfEnabled(DB)
				return
			}
		}

		backoff := time.Duration(i) * 500 * time.Millisecond
		log.Printf("[DATABASE] Connection attempt %d/%d failed: %v. Retrying in %v...", i, maxRetries, err, backoff)
		time.Sleep(backoff)
	}

	log.Println("[DATABASE] PostgreSQL connection skipped (running in-memory mode for development/demo):", err)
}

// CloseDatabase cleanly closes the global database connection pool.
func CloseDatabase() {
	if DB != nil {
		if err := DB.Close(); err != nil {
			log.Printf("[DATABASE] Error closing database connection: %v", err)
		} else {
			log.Println("[DATABASE] Database connection pool cleanly closed.")
		}
	}
}
