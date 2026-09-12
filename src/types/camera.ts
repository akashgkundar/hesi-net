export type CameraStatus =
  | 'idle'
  | 'permission_prompt'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'unsupported'
  | 'error'
  | 'stopped';

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
}

export interface CameraResolution {
  width: number;
  height: number;
}

export interface CameraErrorDetails {
  code: 'PERMISSION_DENIED' | 'DEVICE_NOT_FOUND' | 'DEVICE_IN_USE' | 'UNSUPPORTED' | 'UNKNOWN';
  title: string;
  message: string;
  suggestion: string;
}
