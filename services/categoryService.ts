import axiosInstance from '@/lib/axios';
import type {
  CategoriesResponse,
  Category,
  CategoryFilters,
} from '@/types/category';

class CategoryService {
  private basePath = '/categories';

  async getAll(filters?: CategoryFilters): Promise<CategoriesResponse> {
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

    const response = await axiosInstance.get<CategoriesResponse>(url);
    return response.data;
  }

  async getById(id: string): Promise<Category> {
    const response = await axiosInstance.get<{ data: Category }>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const categoryService = new CategoryService();
