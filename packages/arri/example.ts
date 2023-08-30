/* eslint-disable */
import { arriRequest, ArriRequestError } from "arri-client";

export class ExampleClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  hello: ExampleClientHelloService;
  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.baseUrl = opts.baseUrl ?? "";
    this.headers = opts.headers ?? {};
    this.hello = new ExampleClientHelloService(opts);
  }
}

export class ExampleClientHelloService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.baseUrl = opts.baseUrl ?? "";
    this.headers = opts.headers ?? {};
  }
  async goodbyeWorld(params: HelloGoodbyeWorldParams) {
    return arriRequest<HelloGoodbyeWorldResponse>({
      url: `${this.baseUrl}/rcp/hello/goodbye-world`,
      method: "post",
      params,
      headers: this.headers,
    });
  }
  async helloWorld() {
    return arriRequest<HelloHelloWorldResponse>({
      url: `${this.baseUrl}/rcp/hello/hello-world`,
      method: "post",

      headers: this.headers,
    });
  }
}

export interface HelloGoodbyeWorldParams {
  message: string;
}

export interface HelloGoodbyeWorldResponse {
  id: string;
  message: string;
}

export interface HelloHelloWorldResponse {
  message: string;
}
