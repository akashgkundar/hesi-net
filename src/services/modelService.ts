import type { ModelConnectionStatus, ModelContractSpec } from '../types/model';
import { HesiNetBackendService } from './hesiNetBackendService';

export class ModelService {
  private static cachedStatus: ModelConnectionStatus = 'not_connected';

  /**
   * Returns current integration status with live ping to backend
   */
  public static async checkConnection(): Promise<ModelConnectionStatus> {
    const health = await HesiNetBackendService.checkHealth();
    this.cachedStatus = health && health.ok ? 'connected' : 'not_connected';
    return this.cachedStatus;
  }

  public static getStatus(): ModelConnectionStatus {
    return this.cachedStatus;
  }

  /**
   * Technical specification for the 10-model sequential ensemble architecture
   */
  public static getContractSpec(): ModelContractSpec {
    return {
      endpointType: 'FastAPI',
      version: 'v2.0 (10-Model Sequential Fusion Ensemble)',
      expectedInputFormat: {
        videoFrameWidth: 256,
        videoFrameHeight: 256,
        targetFps: 30,
        colorSpace: 'RGB',
      },
      outputPayloadSchema: {
        hesitationIndex: 'float [0.0 - 1.0] (Ensemble Probability)',
        confidenceScore: 'float [0.0 - 1.0]',
        visualCues: 'string[] (Per-model breakdown: R3D, CNN-BiLSTM, ConvLSTM, X3D, UniFormer, SlowFast, MViT, Swin3D, TimeSformer, VideoMAE)',
      },
    };
  }

  /**
   * Notice message describing the ensemble
   */
  public static getNotice(): string {
    return 'HESI-NET 10-Model Sequential Ensemble (R3D, CNN-BiLSTM, ConvLSTM, X3D, UniFormer, SlowFast, MViT, Swin3D, TimeSformer, VideoMAE) integrated and ready for inference.';
  }
}
