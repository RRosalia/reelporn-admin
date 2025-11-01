export interface AssetMedia {
  id: string;
  uuid: string;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  is_image: boolean;
  is_video: boolean;
  custom_properties: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  thumbnail_url?: string;
  media_url?: string;
  media?: AssetMedia;
  is_featured: boolean;
  is_premium: boolean;
  asset_type: string;
  status: string;
  published_at: string | null;
  metadata: Record<string, any>;
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

export interface AssetsResponse {
  data: Asset[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface AssetFilters {
  page?: number;
  per_page?: number;
  query?: string;
  trashed?: boolean;
  premium?: boolean;
  type?: string;
  status?: string;
  pornstar_id?: string;
}
