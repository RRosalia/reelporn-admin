import axiosInstance from '@/lib/axios';
import type {
  AssetsResponse,
  Asset,
  AssetFilters,
} from '@/types/asset';
import type { GenerateAssetFormData } from '@/components/GenerateAssetModal';

class AssetService {
  private basePath = '/assets';

  async getAll(filters?: AssetFilters): Promise<AssetsResponse> {
    const params = new URLSearchParams();

    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.per_page) {
      params.append('per_page', filters.per_page.toString());
    }
    if (filters?.query) {
      params.append('query', filters.query);
    }
    if (filters?.trashed) {
      params.append('trashed', 'true');
    }
    if (filters?.premium !== undefined) {
      params.append('premium', filters.premium ? 'true' : 'false');
    }
    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.pornstar_id) {
      params.append('pornstar_id', filters.pornstar_id);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await axiosInstance.get<AssetsResponse>(url);
    return response.data;
  }

  async getById(id: string): Promise<Asset> {
    const response = await axiosInstance.get<{ data: Asset }>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  async generate(data: GenerateAssetFormData): Promise<Asset> {
    const response = await axiosInstance.post<{ data: Asset }>(`${this.basePath}/generate`, data);
    return response.data.data;
  }

  async getImageModels(): Promise<Array<{ value: string; label: string }>> {
    const response = await axiosInstance.get<{ data: Array<{ value: string; label: string }> }>(`${this.basePath}/models/image`);
    return response.data.data;
  }

  async getStatuses(): Promise<Array<{ value: string; label: string }>> {
    const response = await axiosInstance.get<{ data: Array<{ value: string; label: string }> }>(`${this.basePath}/statuses`);
    return response.data.data;
  }
}

export const assetService = new AssetService();
