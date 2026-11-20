export type ModelConnectionStatus = 'not_connected' | 'connecting' | 'connected' | 'error';

export interface ModelContractSpec {
  endpointType: 'REST' | 'WebSocket' | 'FastAPI' | 'Local_ONNX';
  version: string;
  expectedInputFormat: {
    videoFrameWidth: number;
    videoFrameHeight: number;
    targetFps: number;
    colorSpace: 'RGB';
  };
  outputPayloadSchema: {
    hesitationIndex: string;
    confidenceScore: string;
    visualCues: string;
  };
}
