import axiosInstance from '@/lib/axios';
import type {
  AssetsResponse,
  Asset,
  AssetFilters,
} from '@/types/asset';

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

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await axiosInstance.get<AssetsResponse>(url);
    return response.data;
  }

  async getById(id: string): Promise<Asset> {
    const response = await axiosInstance.get<{ data: Asset }>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const assetService = new AssetService();
