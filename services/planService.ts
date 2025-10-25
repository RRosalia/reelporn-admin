import axiosInstance from '@/lib/axios';
import type {
  PlansResponse,
  Plan,
  PlanFilters,
} from '@/types/plan';

class PlanService {
  private basePath = '/plans';

  async getAll(filters?: PlanFilters): Promise<PlansResponse> {
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

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await axiosInstance.get<PlansResponse>(url);
    return response.data;
  }

  async getById(id: string): Promise<Plan> {
    const response = await axiosInstance.get<{ data: Plan }>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const planService = new PlanService();
