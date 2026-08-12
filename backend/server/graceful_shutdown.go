package server

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

func StartWithGracefulShutdown(router *gin.Engine, port string) {
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	go func() {
		fmt.Printf("NetSentinel-X Cloud Engine Running On Port: %s (Kubernetes Native)\n", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("HTTP Server Listen Error: %v\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	fmt.Println("\n[SIGTERM Received] Initiating 30s Graceful Pod Shutdown Draining Sequence...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		fmt.Printf("Forced Server Shutdown Error: %v\n", err)
	} else {
		fmt.Println("[Shutdown Complete] All active connections drained cleanly. Pod exiting.")
	}
}
