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
  async getUser(params: UsersGetUserParams) {
    return arriRequest<User>({
      url: `${this.baseUrl}/users/get-user`,
      method: "get",
      params,
      headers: this.headers,
    });
  }
  async updateUser(params: UsersUpdateUserParams) {
    return arriRequest<User>({
      url: `${this.baseUrl}/users/update-user`,
      method: "post",
      params,
      headers: this.headers,
    });
  }
}

export interface UsersGetUserParams {
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  /**
   * must be an integer
   */
  createdAt: number;
}

export interface UsersUpdateUserParams {
  userId: string;
  data: UserUpdateData;
}
export interface UserUpdateData {
  name: string;
  email: string;
  /**
   * must be an integer
   */
  createdAt: number;
}
