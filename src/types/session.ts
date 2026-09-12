export type SessionStatus = 'idle' | 'ready' | 'active' | 'paused' | 'stopped';

export interface SessionMetrics {
  durationSeconds: number;
  startTime: number | null;
  endTime: number | null;
  activeDeviceId: string | null;
  deviceLabel: string | null;
  resolution: {
    width: number;
    height: number;
  } | null;
}
