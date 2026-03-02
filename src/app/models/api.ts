import { Post } from './post';
import { User } from './user';

/** Generic API response wrapper matching backend shape */
export interface ApiResponse<T> {
  status: string;
  data: T;
}

/** Pagination metadata returned alongside list endpoints */
export interface Pagination {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

/** Shape returned by list-post endpoints */
export interface PostListResponse {
  posts: Post[];
  pagination: Pagination | null;
}

/** Query parameters accepted by public post list endpoints */
export interface PostQueryParams {
  page?: number;
  limit?: number;
  tag?: string;
  series?: string;
  search?: string;
  permission?: string;
  excludeContent?: boolean;
}

/** Credentials sent to the login endpoint */
export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

/** Credentials sent to change-password endpoint */
export interface ChangePasswordPayload {
  oldPassword: string;
  /** New password field — matches the `password` form control name */
  password: string;
  confirmPassword?: string;
}

/** Credentials sent to reset-password (request email) endpoint */
export interface ResetPasswordPayload {
  email: string;
}

/** Credentials sent to set-new-password (after email link) endpoint */
export interface SetNewPasswordPayload {
  password: string;
  confirmPassword: string;
  token: string;
}

/** Registration payload */
export interface RegisterPayload {
  fullName: string;
  username: string;
  email?: string;
  password: string;
}

/** Shape of `data` inside the login API response */
export interface AuthUserData extends User {
  email?: string;
  _id?: string;
}

/** Shape of the full login API response */
export interface LoginApiResponse extends ApiResponse<AuthUserData> {}

/** Auth-related signals state for the AuthStateService */
export interface AuthState {
  user: AuthUserData | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isGrandAdmin: boolean;
}
