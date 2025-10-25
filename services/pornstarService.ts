import axiosInstance from '@/lib/axios';
import type {
  PornstarsResponse,
  Pornstar,
  PornstarFilters,
  CreatePornstarData,
  UpdatePornstarData,
} from '@/types/pornstar';

class PornstarService {
  private basePath = '/pornstars';

  async getAll(filters?: PornstarFilters): Promise<PornstarsResponse> {
    const params = new URLSearchParams();

    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.per_page) {
      params.append('per_page', filters.per_page.toString());
    }
    if (filters?.trashed) {
      params.append('trashed', '1');
    }
    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.country_id) {
      params.append('country_id', filters.country_id.toString());
    }
    if (filters?.query) {
      params.append('query', filters.query);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await axiosInstance.get<PornstarsResponse>(url);
    return response.data;
  }

  async getById(id: string): Promise<Pornstar> {
    const response = await axiosInstance.get<{ data: Pornstar }>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  async create(data: CreatePornstarData): Promise<Pornstar> {
    const response = await axiosInstance.post<{ data: Pornstar }>(this.basePath, data);
    return response.data.data;
  }

  async update(id: string, data: UpdatePornstarData): Promise<Pornstar> {
    const response = await axiosInstance.put<{ data: Pornstar }>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.basePath}/${id}`);
  }

  async restore(id: string): Promise<Pornstar> {
    const response = await axiosInstance.post<{ data: Pornstar }>(`${this.basePath}/${id}/restore`);
    return response.data.data;
  }
}

export const pornstarService = new PornstarService();
