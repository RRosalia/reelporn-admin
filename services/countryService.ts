import axiosInstance from '@/lib/axios';
import type { Country } from '@/types/pornstar';

class CountryService {
  private basePath = '/countries';

  async getAll(): Promise<Country[]> {
    const response = await axiosInstance.get<{ data: Country[] }>(this.basePath);
    return response.data.data;
  }
}

export const countryService = new CountryService();
