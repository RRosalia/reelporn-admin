export interface GpuMessage {
  timestamp: string;
  received_at: string;
  server_uuid: string;
  event: string;
  task_id?: string;
  task_type?: string;
  details?: Record<string, any>;
  [key: string]: any;
}

export interface GpuServer {
  server_uuid: string;
  first_seen: string;
  last_seen: string;
  event: string;
  last_event_timestamp: string;
  messages: GpuMessage[];
  message_count: number;
}

export interface GpuStatistics {
  total_servers: number;
  active_servers: number;
  idle_servers: number;
}

export interface GpuServersResponse {
  data: GpuServer[];
  statistics: GpuStatistics;
}
