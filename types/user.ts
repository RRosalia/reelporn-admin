export interface User {
  id: number;
  name: string;
  nickname: string;
  email: string;
  email_verified_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface UsersResponse {
  data: User[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface UserFilters {
  page?: number;
  per_page?: number;
  query?: string;
  trashed?: boolean;
}
