export interface Payment {
  id: number;
  user_id: number;
  payable_type: string;
  payable_id: number;
  payment_method: 'crypto' | 'paypal' | 'stripe' | 'credit_card';
  amount_cents: number;
  status: 'pending' | 'detected' | 'processing' | 'completed' | 'failed' | 'expired' | 'cancelled';
  payment_data: Record<string, any>;
  metadata: Record<string, any>;
  expires_at: string | null;
  completed_at: string | null;
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

export interface PaymentsResponse {
  data: Payment[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface PaymentFilters {
  page?: number;
  per_page?: number;
  query?: string;
}
