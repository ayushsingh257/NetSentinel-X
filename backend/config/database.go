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

	for i := 0; i < 10; i++ {

		DB, err = sql.Open("postgres", psqlInfo)

		if err == nil {

			err = DB.Ping()

			if err == nil {
				fmt.Println("Connected to PostgreSQL")
				return
			}
		}

		fmt.Println("Waiting for database...")
		time.Sleep(5 * time.Second)
	}

	log.Fatal("Database unreachable:", err)
}