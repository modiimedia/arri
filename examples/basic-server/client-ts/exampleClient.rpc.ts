/* eslint-disable */
import { arriRequest, ArriRequestError } from "arri-client";

export class ExampleClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  users: ExampleClientUsersService;
  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.baseUrl = opts.baseUrl ?? "";
    this.headers = opts.headers ?? {};
    this.users = new ExampleClientUsersService(opts);
  }
}

export class ExampleClientUsersService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.baseUrl = opts.baseUrl ?? "";
    this.headers = opts.headers ?? {};
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

export interface UsersGetUserResponse {
  id: string;
  username: string;
  email: string;
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
