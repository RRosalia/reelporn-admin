import axiosInstance from '@/lib/axios';
import type {
  UsersResponse,
  User,
  UserFilters,
} from '@/types/user';

class UserService {
  private basePath = '/users';

  async getAll(filters?: UserFilters): Promise<UsersResponse> {
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

    const response = await axiosInstance.get<UsersResponse>(url);
    return response.data;
  }

  async getById(id: string): Promise<User> {
    const response = await axiosInstance.get<{ data: User }>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const userService = new UserService();
