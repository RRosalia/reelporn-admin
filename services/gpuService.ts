import axiosInstance from '@/lib/axios';
import type { GpuServersResponse, GpuServer } from '@/types/gpu';

class GpuService {
  private basePath = '/gpus';

  async getAll(messageLimit = 20): Promise<GpuServersResponse> {
    const response = await axiosInstance.get<GpuServersResponse>(
      `${this.basePath}?message_limit=${messageLimit}`
    );
    return response.data;
  }

  async getById(serverUuid: string, messageLimit = 100): Promise<GpuServer> {
    const response = await axiosInstance.get<{ data: GpuServer }>(
      `${this.basePath}/${serverUuid}?message_limit=${messageLimit}`
    );
    return response.data.data;
  }

  async provision(): Promise<{ message: string; data?: any }> {
    const response = await axiosInstance.post<{ message: string; data?: any }>(
      `${this.basePath}/provision`
    );
    return response.data;
  }
}

export const gpuService = new GpuService();
