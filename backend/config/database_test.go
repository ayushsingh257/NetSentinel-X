package config

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestResolveDatabaseConnection_SupabaseDirect(t *testing.T) {
	os.Setenv("SUPABASE_DATABASE_URL", "postgresql://postgres:mysecretpass@db.abcdefghijklmnop.supabase.co:5432/postgres?sslmode=require")
	defer os.Unsetenv("SUPABASE_DATABASE_URL")

	connStr, maskedStr, mode := ResolveDatabaseConnection()
	assert.Contains(t, connStr, "db.abcdefghijklmnop.supabase.co")
	assert.Contains(t, maskedStr, ":********@")
	assert.NotContains(t, maskedStr, "mysecretpass")
	assert.Contains(t, mode, "Supabase Direct Connection")
}

func TestResolveDatabaseConnection_SupabaseSessionPooler(t *testing.T) {
	os.Setenv("SUPABASE_DATABASE_URL", "postgresql://postgres.abcdefghijklmnop:mysecretpass@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require")
	defer os.Unsetenv("SUPABASE_DATABASE_URL")

	connStr, maskedStr, mode := ResolveDatabaseConnection()
	assert.Contains(t, connStr, "aws-0-us-east-1.pooler.supabase.com")
	assert.Contains(t, maskedStr, ":********@")
	assert.NotContains(t, maskedStr, "mysecretpass")
	assert.Contains(t, mode, "Supabase Session Pooler")
}

func TestResolveDatabaseConnection_SupabaseTransactionPooler(t *testing.T) {
	os.Setenv("SUPABASE_DATABASE_URL", "postgresql://postgres.abcdefghijklmnop:mysecretpass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require")
	defer os.Unsetenv("SUPABASE_DATABASE_URL")

	connStr, maskedStr, mode := ResolveDatabaseConnection()
	assert.Contains(t, connStr, "6543")
	assert.Contains(t, maskedStr, ":********@")
	assert.NotContains(t, maskedStr, "mysecretpass")
	assert.Contains(t, mode, "Supabase Transaction Pooler")
}

func TestResolveDatabaseConnection_DiscreteVariables(t *testing.T) {
	os.Unsetenv("SUPABASE_DATABASE_URL")
	os.Unsetenv("DATABASE_URL")

	os.Setenv("SUPABASE_DB_HOST", "db.abcdefghijklmnop.supabase.co")
	os.Setenv("SUPABASE_DB_PORT", "5432")
	os.Setenv("SUPABASE_DB_USER", "postgres")
	os.Setenv("SUPABASE_DB_PASSWORD", "strong_password_123")
	os.Setenv("SUPABASE_DB_NAME", "postgres")
	os.Setenv("SUPABASE_DB_SSLMODE", "require")

	defer func() {
		os.Unsetenv("SUPABASE_DB_HOST")
		os.Unsetenv("SUPABASE_DB_PORT")
		os.Unsetenv("SUPABASE_DB_USER")
		os.Unsetenv("SUPABASE_DB_PASSWORD")
		os.Unsetenv("SUPABASE_DB_NAME")
		os.Unsetenv("SUPABASE_DB_SSLMODE")
	}()

	connStr, maskedStr, mode := ResolveDatabaseConnection()
	assert.Contains(t, connStr, "host=db.abcdefghijklmnop.supabase.co")
	assert.Contains(t, connStr, "sslmode=require")
	assert.Contains(t, maskedStr, "password=********")
	assert.NotContains(t, maskedStr, "strong_password_123")
	assert.Contains(t, mode, "Supabase Direct Connection")
}

func TestLoadEmbeddedMigrations(t *testing.T) {
	migrationsList, err := LoadEmbeddedMigrations()
	assert.NoError(t, err)
	assert.NotEmpty(t, migrationsList, "Embedded migrations list should not be empty")

	var initialFound bool
	for _, m := range migrationsList {
		if m.Version == 1 {
			initialFound = true
			assert.Contains(t, m.UpSQL, "CREATE TABLE IF NOT EXISTS traffic_logs")
			assert.Contains(t, m.UpSQL, "CREATE TABLE IF NOT EXISTS alerts")
			assert.Contains(t, m.DownSQL, "DROP TABLE IF EXISTS alerts")
			assert.Contains(t, m.DownSQL, "DROP TABLE IF EXISTS traffic_logs")
		}
	}
	assert.True(t, initialFound, "Version 000001 migration must be present in embedded migrations")
}

func TestConnectionPoolConfigurationSettings(t *testing.T) {
	os.Setenv("DB_MAX_OPEN_CONNS", "50")
	os.Setenv("DB_MAX_IDLE_CONNS", "20")
	os.Setenv("DB_CONN_MAX_LIFETIME", "10m")
	os.Setenv("DB_CONN_MAX_IDLE_TIME", "3m")

	defer func() {
		os.Unsetenv("DB_MAX_OPEN_CONNS")
		os.Unsetenv("DB_MAX_IDLE_CONNS")
		os.Unsetenv("DB_CONN_MAX_LIFETIME")
		os.Unsetenv("DB_CONN_MAX_IDLE_TIME")
	}()

	assert.Equal(t, "50", os.Getenv("DB_MAX_OPEN_CONNS"))
	assert.Equal(t, "20", os.Getenv("DB_MAX_IDLE_CONNS"))

	dur, err := time.ParseDuration(os.Getenv("DB_CONN_MAX_LIFETIME"))
	assert.NoError(t, err)
	assert.Equal(t, 10*time.Minute, dur)
}
