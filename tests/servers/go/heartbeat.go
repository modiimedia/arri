package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

type HeartbeatTestMessage struct {
	Message string
}

func registerHeartbeatTestRoute(mux *http.ServeMux) {
	mux.HandleFunc("/heartbeat-test", func(w http.ResponseWriter, r *http.Request) {
		ctx, _ := context.WithCancel(r.Context())
		enabledQuery := r.URL.Query().Get("heartbeatEnabled")
		heartbeatEnabled := enabledQuery == "true" || enabledQuery == "TRUE"
		w.Header().Add("content-type", "text/event-stream")
		w.Header().Add("heartbeat-interval", "300")
		if arri.IsHttp2(r) {
			w.Header().Set("Connection", "keep-alive")
			w.Header().Set("Transfer-Encoding", "chunked")
		}
		w.Header().Set("x-accel-buffering", "no")
		w.WriteHeader(200)
		payload, _ := arri.EncodeJSON(HeartbeatTestMessage{Message: "hello world"}, arri.EncodingOptions{})
		responseController := http.NewResponseController(w)
		responseController.EnableFullDuplex()

		var heartbeatTicker *time.Ticker
		if heartbeatEnabled {
			heartbeatTicker = time.NewTicker(time.Millisecond * 300)
			defer heartbeatTicker.Stop()
		}

		for i := 0; i < 5; i++ {
			fmt.Fprintf(w, "event: message\ndata:%s\n\n", payload)
			responseController.Flush()
		}

		var msgTicker *time.Ticker = time.NewTicker(time.Second * 1)
		defer msgTicker.Stop()
		if heartbeatTicker != nil {
			for {
				select {
				case <-heartbeatTicker.C:
					fmt.Fprintf(w, "event: heartbeat\ndata:\n\n")
					responseController.Flush()
				case <-msgTicker.C:
					fmt.Fprintf(w, "event: message\ndata: %s\n\n", payload)
					responseController.Flush()
				case <-ctx.Done():
					return
				}
			}
		}
		for {
			select {
			case <-msgTicker.C:
				fmt.Fprintf(w, "event: message\ndata: %s\n\n", payload)
				responseController.Flush()
			case <-ctx.Done():
				return
			}
		}
	})
}
