export interface Plan {
  id: number;
  name: string;
  plan_group: string;
  price: number; // in cents
  periodicity_type: 'day' | 'week' | 'month' | 'year';
  periodicity: number;
  grace_days: number;
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

export interface PlansResponse {
  data: Plan[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface PlanFilters {
  page?: number;
  per_page?: number;
  query?: string;
}
