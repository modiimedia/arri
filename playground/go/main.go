package main

import (
	"fmt"
	"net/http"
	"time"

	"arrirpc.com/arri"
	"github.com/google/uuid"
)

func main() {
	app := arri.NewApp(http.DefaultServeMux, arri.AppOptions[arri.DefaultContext]{}, arri.CreateDefaultContext)
	arri.EventStreamRpc(&app, WatchMessages, arri.RpcOptions{})
	app.Run(arri.RunOptions{})
}

type WatchMessagesParams struct {
	ChannelId string
}

type Message struct {
	Id        string
	Text      string
	CreatedAt time.Time
}

func WatchMessages(params WatchMessagesParams, controller arri.SseController[Message], context arri.DefaultContext) arri.RpcError {
	// create ticker that fires each second
	t := time.NewTicker(time.Second)
	defer t.Stop()
	msgCount := 0
	for {
		select {
		case <-t.C:
			// send a message to the client every tick
			msgCount++
			controller.Push(Message{
				Id:        uuid.NewString(),
				Text:      "hello world " + fmt.Sprint(msgCount),
				CreatedAt: time.Now(),
			})
		case <-controller.Done():
			return nil
		}
	}
}
