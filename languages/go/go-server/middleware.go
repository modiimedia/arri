package arri

type Middleware[TMeta any] func(event Event[TMeta]) RpcError

func Use[TMeta any](app *App[TMeta], middleware Middleware[TMeta]) {
	app.middleware = append(app.middleware, middleware)
}
