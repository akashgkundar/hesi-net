export interface HesiNetServerPrediction {
  probability: number;
  label: 'hesitation' | 'no hesitation';
  per_model: Record<string, number>;
}

export interface ModelServerHealth {
  ok: boolean;
  models: string[];
}

const DEFAULT_SERVER_URL = import.meta.env.VITE_HESINET_API_URL || 'http://localhost:8000';

export class HesiNetBackendService {
  private static serverUrl: string = DEFAULT_SERVER_URL;

  public static setServerUrl(url: string) {
    this.serverUrl = url;
  }

  public static getServerUrl(): string {
    return this.serverUrl;
  }

  /**
   * Health check to test if the 10-model backend server is online
   */
  public static async checkHealth(): Promise<ModelServerHealth | null> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.serverUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(id);
      if (res.ok) {
        return (await res.json()) as ModelServerHealth;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Send captured video frame blobs to the FastAPI backend model chain
   */
  public static async predictFrames(frameBlobs: Blob[]): Promise<HesiNetServerPrediction | null> {
    try {
      const formData = new FormData();
      frameBlobs.forEach((blob, idx) => {
        formData.append('frames', blob, `frame_${idx}.jpg`);
      });

      const res = await fetch(`${this.serverUrl}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        console.error('Failed to get prediction from HESI-NET backend', res.statusText);
        return null;
      }

      const data: HesiNetServerPrediction = await res.json();
      return data;
    } catch (err) {
      console.error('Error contacting HESI-NET backend:', err);
      return null;
    }
  }
}
