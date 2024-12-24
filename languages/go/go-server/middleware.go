package arri

import "net/http"

type Middleware[TEvent Event] func(r *http.Request, event TEvent, rpcName string) RpcError

func Use[TEvent Event](app *App[TEvent], middleware Middleware[TEvent]) {
	app.middleware = append(app.middleware, middleware)
}
