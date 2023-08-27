/* eslint-disable */
import { arriRequest, ArriRequestError } from "arri-client";

export class TypescriptClient {
  users: TypescriptClientUsersService;
  posts: TypescriptClientPostsService;
  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.users = new TypescriptClientUsersService(opts);
    this.posts = new TypescriptClientPostsService(opts);
  }
}

export class TypescriptClientUsersService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.baseUrl = opts.baseUrl ?? "";
    this.headers = opts.headers ?? {};
  }
  async getUser(params: UserParams) {
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

export class TypescriptClientPostsService {
  private baseUrl: string;
  private headers: Record<string, string>;
  comments: TypescriptClientPostsCommentsService;
  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.baseUrl = opts.baseUrl ?? "";
    this.headers = opts.headers ?? {};
    this.comments = new TypescriptClientPostsCommentsService(opts);
  }
  async getPost(params: PostParams) {
    return arriRequest<Post>({
      url: `${this.baseUrl}/posts/get-post`,
      method: "get",
      params,
      headers: this.headers,
    });
  }
}
export class TypescriptClientPostsCommentsService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
    this.baseUrl = opts.baseUrl ?? "";
    this.headers = opts.headers ?? {};
  }
  async getComment(params: PostCommentParams) {
    return arriRequest<undefined>({
      url: `${this.baseUrl}/posts/comments/get-comment`,
      method: "get",
      params,
      headers: this.headers,
    });
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface UserParams {
  userId: string;
}

export interface UsersUpdateUserParams {
  userId: string;
  data: UsersUpdateUserParamsData;
}
export interface UsersUpdateUserParamsData {
  id?: string;
  name?: string;
  email?: string;
  createdAt?: Date;
}

export interface PostParams {
  postId: string;
}

export interface Post {
  id: string;
  title: string;
  /**
   * must be an integer
   */
  createdAt: number;
}

export interface PostCommentParams {
  postId: string;
  commentId: string;
}
