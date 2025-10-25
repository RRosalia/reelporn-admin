export interface Country {
  id: number;
  name: string;
  iso: string;
  iso_alpha_3: string;
}

export interface ProfileImage {
  thumb: string;
  small: string;
  medium: string;
  large: string;
  original: string;
}

export interface Bio {
  content: string;
  language: string;
}

export interface Pornstar {
  id: string;
  slug: string;
  type: 'real' | 'virtual';
  first_name: string;
  last_name: string;
  bio: Bio;
  profile_image: ProfileImage | null;
  date_of_birth: string;
  age: number;
  country: Country | null;
  height_cm: number | null;
  weight_kg: number | null;
  hair_color: string | null;
  eye_color: string | null;
  ethnicity: string | null;
  videos_count: number;
  images_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PornstarsResponse {
  data: Pornstar[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface PornstarFilters {
  page?: number;
  per_page?: number;
  trashed?: boolean;
  type?: 'real' | 'virtual';
  country_id?: number;
  query?: string;
}

export interface CreatePornstarData {
  first_name: string;
  last_name: string;
  type: 'real' | 'virtual';
  bio_content?: string;
  bio_language?: string;
  date_of_birth?: string;
  country_id?: number;
  height_cm?: number;
  weight_kg?: number;
  hair_color?: string;
  eye_color?: string;
  ethnicity?: string;
}

export interface UpdatePornstarData extends Partial<CreatePornstarData> {}
