import axiosInstance from '@/lib/axios';
import type {
  PornstarsResponse,
  Pornstar,
  PornstarFilters,
  CreatePornstarData,
  UpdatePornstarData,
} from '@/types/pornstar';
import type { Asset } from '@/types/asset';
import type { GenerateAssetFormData } from '@/components/GenerateAssetModal';

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
    if (filters?.status) {
      params.append('status', filters.status);
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

  async activate(id: string): Promise<Pornstar> {
    const response = await axiosInstance.put<{ data: Pornstar }>(`${this.basePath}/${id}/activate`);
    return response.data.data;
  }

  async getAssets(id: string): Promise<Asset[]> {
    const response = await axiosInstance.get<{ data: Asset[] }>(`${this.basePath}/${id}/assets`);
    return response.data.data;
  }

  async generateAsset(id: string, data: GenerateAssetFormData): Promise<Asset> {
    const response = await axiosInstance.post<{ data: Asset }>(`${this.basePath}/${id}/assets/generate`, data);
    return response.data.data;
  }
}

export const pornstarService = new PornstarService();
