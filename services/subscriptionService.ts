import axiosInstance from '@/lib/axios';
import type {
  SubscriptionsResponse,
  Subscription,
  SubscriptionFilters,
} from '@/types/subscription';

class SubscriptionService {
  private basePath = '/subscriptions';

  async getAll(filters?: SubscriptionFilters): Promise<SubscriptionsResponse> {
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

    const response = await axiosInstance.get<SubscriptionsResponse>(url);
    return response.data;
  }

  async getById(id: string): Promise<Subscription> {
    const response = await axiosInstance.get<{ data: Subscription }>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const subscriptionService = new SubscriptionService();
