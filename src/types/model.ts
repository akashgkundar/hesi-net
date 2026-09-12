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
    hesitationIndex: 'float [0.0 - 1.0] (Future)';
    confidenceScore: 'float [0.0 - 1.0] (Future)';
    visualCues: 'string[] (Future)';
  };
}
