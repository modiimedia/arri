package arri

type Middleware[TMeta any] func(req *Request[TMeta]) RpcError

func RegisterMiddleware[TMeta any](app *App[TMeta], middleware Middleware[TMeta]) {
	app.middleware = append(app.middleware, middleware)
	for _, adapter := range app.adapters {
		adapter.Use(middleware)
	}
}
