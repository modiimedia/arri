/* eslint-disable */
import { arriRequest, ArriRequestError } from "arri-client";

export class ExampleClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  test: ExampleClientTestService;
  users: ExampleClientUsersService;
  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.baseUrl = opts.baseUrl ?? "";
    this.headers = opts.headers ?? {};
    this.test = new ExampleClientTestService(opts);
    this.users = new ExampleClientUsersService(opts);
  }
}

export class ExampleClientTestService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.baseUrl = opts.baseUrl ?? "";
    this.headers = opts.headers ?? {};
  }
  async getTest() {
    return arriRequest<TestGetTestResponse>({
      url: `${this.baseUrl}/test/get-test`,
      method: "get",

      headers: this.headers,
    });
  }
}

export class ExampleClientUsersService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.baseUrl = opts.baseUrl ?? "";
    this.headers = opts.headers ?? {};
  }
  async deleteUser(params: UsersDeleteUserParams) {
    return arriRequest<UsersDeleteUserResponse>({
      url: `${this.baseUrl}/users/delete-user`,
      method: "get",
      params,
      headers: this.headers,
    });
  }
  async getUser() {
    return arriRequest<UsersGetUserResponse>({
      url: `${this.baseUrl}/users/get-user`,
      method: "get",

      headers: this.headers,
    });
  }
  async getUsers(params: UsersGetUsersParams) {
    return arriRequest<UsersGetUsersResponse>({
      url: `${this.baseUrl}/users/get-users`,
      method: "get",
      params,
      headers: this.headers,
    });
  }
  async updateUser(params: UsersUpdateUserParams) {
    return arriRequest<UsersUpdateUserResponse>({
      url: `${this.baseUrl}/users/update-user`,
      method: "get",
      params,
      headers: this.headers,
    });
  }
}

export interface TestGetTestResponse {
  message: string;
}

export interface UsersDeleteUserParams {
  id: string;
}

export interface UsersDeleteUserResponse {
  id: string;
  name: string;
}

export interface UsersGetUserResponse {
  id: string;
  username: string;
  email: string;
  /**
   * must be an integer
   */
  createdAt: number;
}

export interface UsersGetUsersParams {
  limit: number;
}

export interface UsersGetUsersResponse {
  total: number;
  items: UserSchema[];
}
export interface UserSchema {
  id: string;
  email: string;
  username: string;
}

export interface UsersUpdateUserParams {
  userId: string;
}

export interface UsersUpdateUserResponse {
  id: string;
  username: string;
  email: string;
}
