import {
    fromNodeMiddleware,
    type App,
    type NodeMiddleware,
    type Router,
    type NodeListener,
    type RouterMethod,
} from "h3";

export class ArriCompat {
    private readonly h3App: App;
    private readonly h3Route: Router;

    constructor(options: { h3App: App; h3Router: Router }) {
        this.h3App = options.h3App;
        this.h3Route = options.h3Router;
    }

    private registerRoute(
        path: string,
        method: RouterMethod,
        handler: NodeListener,
    ) {
        switch (method) {
            case "connect":
                this.h3Route.connect(path, fromNodeMiddleware(handler));
                break;
            case "delete":
                this.h3Route.delete(path, fromNodeMiddleware(handler));
                break;
            case "get":
                this.h3Route.get(path, fromNodeMiddleware(handler));
                break;
            case "head":
                this.h3Route.head(path, fromNodeMiddleware(handler));
                break;
            case "options":
                this.h3Route.options(path, fromNodeMiddleware(handler));
                break;
            case "patch":
                this.h3Route.patch(path, fromNodeMiddleware(handler));
                break;
            case "post":
                this.h3Route.post(path, fromNodeMiddleware(handler));
                break;
            case "put":
                this.h3Route.put(path, fromNodeMiddleware(handler));
                break;
            case "trace":
                this.h3Route.trace(path, fromNodeMiddleware(handler));
                break;
        }
    }

    /**
     *
     * Register a legacy node middleware
     */
    use(middleware: NodeMiddleware | NodeListener): void;
    use(path: string, middleware: NodeMiddleware | NodeListener): void;
    use(
        pathOrMiddleware: string | NodeMiddleware | NodeListener,
        middleware?: NodeMiddleware | NodeListener,
    ): void {
        console.log(pathOrMiddleware, middleware);
        if (typeof pathOrMiddleware === "string" && middleware) {
            this.h3App.use(pathOrMiddleware, fromNodeMiddleware(middleware));
            return;
        }
        if (typeof pathOrMiddleware === "function") {
            this.h3App.use(fromNodeMiddleware(pathOrMiddleware));
        }
    }

    all(path: string, handler: NodeListener) {
        this.h3App.use(path, fromNodeMiddleware(handler));
    }

    connect(path: string, handler: NodeListener) {
        this.registerRoute(path, "connect", handler);
    }

    delete(path: string, handler: NodeListener) {
        this.registerRoute(path, "delete", handler);
    }

    get(path: string, handler: NodeListener) {
        this.registerRoute(path, "get", handler);
    }

    head(path: string, handler: NodeListener) {
        this.registerRoute(path, "head", handler);
    }

    options(path: string, handler: NodeListener) {
        this.registerRoute(path, "options", handler);
    }

    patch(path: string, handler: NodeListener) {
        this.registerRoute(path, "patch", handler);
    }

    post(path: string, handler: NodeListener) {
        this.registerRoute(path, "post", handler);
    }

    put(path: string, handler: NodeListener) {
        this.registerRoute(path, "put", handler);
    }

    trace(path: string, handler: NodeListener) {
        this.registerRoute(path, "put", handler);
    }
}
