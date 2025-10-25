export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  assets_count: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
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

export interface CategoriesResponse {
  data: Category[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface CategoryFilters {
  page?: number;
  per_page?: number;
  query?: string;
  trashed?: boolean;
}
