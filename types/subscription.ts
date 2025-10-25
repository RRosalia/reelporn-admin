export interface Subscription {
  id: number;
  subscriber_type: string;
  subscriber_id: number;
  plan_id: number;
  started_at: string;
  canceled_at: string | null;
  expired_at: string | null;
  grace_days_ended_at: string | null;
  suppressed_at: string | null;
  was_switched: boolean;
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

export interface SubscriptionsResponse {
  data: Subscription[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface SubscriptionFilters {
  page?: number;
  per_page?: number;
  query?: string;
}
