import type { SessionMetrics } from '../types/session';

export class SessionService {
  public static createInitialMetrics(): SessionMetrics {
    return {
      durationSeconds: 0,
      startTime: null,
      endTime: null,
      activeDeviceId: null,
      deviceLabel: null,
      resolution: null,
    };
  }

  public static formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }
}
