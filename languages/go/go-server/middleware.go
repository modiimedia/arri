package arri

type Middleware[TProps any] func(req *Request[TProps]) RpcError

func Use[TProps any](app *App[TProps], middleware Middleware[TProps]) {
	app.middleware = append(app.middleware, middleware)
}
