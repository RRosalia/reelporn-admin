import axiosInstance from '@/lib/axios';
import type {
  PaymentsResponse,
  Payment,
  PaymentFilters,
} from '@/types/payment';

class PaymentService {
  private basePath = '/payments';

  async getAll(filters?: PaymentFilters): Promise<PaymentsResponse> {
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

    const response = await axiosInstance.get<PaymentsResponse>(url);
    return response.data;
  }

  async getById(id: string): Promise<Payment> {
    const response = await axiosInstance.get<{ data: Payment }>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const paymentService = new PaymentService();
