package arri

import (
	"fmt"
	"net/http"
)

type SseController[T any] interface {
	Push(T) RpcError
	Connect() RpcError
	Close()
}

type DefaultSseController[T any] struct {
	w         http.ResponseWriter
	r         *http.Request
	keyCasing KeyCasing
}

func (controller *DefaultSseController[T]) Push(message T) RpcError {
	body, bodyErr := EncodeJSON(message, controller.keyCasing)
	if bodyErr != nil {
		return Error(500, bodyErr.Error())
	}
	fmt.Fprintf(controller.w, "event: message\nmessage: %s\n\n", body)
	controller.w.(http.Flusher).Flush()
	return nil
}

func (controller *DefaultSseController[T]) Close() {
	controller.w.(http.CloseNotifier).CloseNotify()
}

func eventHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Expose-Headers", "Content-Type")
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

}
