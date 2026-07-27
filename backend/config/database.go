package config

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func ConnectDatabase() {

	host := GetEnv("DB_HOST")
	port := GetEnv("DB_PORT")
	user := GetEnv("DB_USER")
	password := GetEnv("DB_PASSWORD")
	dbname := GetEnv("DB_NAME")
	sslmode := GetEnv("DB_SSLMODE")

	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "5432"
	}
	if sslmode == "" {
		sslmode = "disable"
	}

	psqlInfo := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host,
		port,
		user,
		password,
		dbname,
		sslmode,
	)

	var err error

	for i := 0; i < 3; i++ {

		DB, err = sql.Open("postgres", psqlInfo)

		if err == nil {

			err = DB.Ping()

			if err == nil {
				fmt.Println("Connected to PostgreSQL")
				return
			}
		}

		time.Sleep(1 * time.Second)
	}

	log.Println("PostgreSQL connection skipped (running in-memory mode for development/demo):", err)
}
