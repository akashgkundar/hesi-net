import type { ModelConnectionStatus, ModelContractSpec } from '../types/model';

export class ModelService {
  /**
   * Returns current integration status.
   * Lock requirement: Always 'not_connected' in current frontend phase.
   */
  public static getStatus(): ModelConnectionStatus {
    return 'not_connected';
  }

  /**
   * Provides technical specification for the future model integration interface.
   * Demonstrates readiness for REST, WebSocket, or local model connection.
   */
  public static getContractSpec(): ModelContractSpec {
    return {
      endpointType: 'WebSocket',
      version: 'v1.0-draft (Unconnected)',
      expectedInputFormat: {
        videoFrameWidth: 1280,
        videoFrameHeight: 720,
        targetFps: 30,
        colorSpace: 'RGB',
      },
      outputPayloadSchema: {
        hesitationIndex: 'float [0.0 - 1.0] (Future)',
        confidenceScore: 'float [0.0 - 1.0] (Future)',
        visualCues: 'string[] (Future)',
      },
    };
  }

  /**
   * Placeholder notice message
   */
  public static getNotice(): string {
    return 'The trained visual decision hesitation model will be connected here in a future development stage.';
  }
}
