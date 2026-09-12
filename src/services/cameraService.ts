import type { CameraDeviceInfo, CameraErrorDetails, CameraResolution } from '../types/camera';

export class CameraService {
  /**
   * Checks if browser supports mediaDevices API
   */
  public static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Enumerate available video input devices (cameras)
   */
  public static async getAvailableCameras(): Promise<CameraDeviceInfo[]> {
    if (!this.isSupported()) return [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${index + 1} (${d.deviceId.slice(0, 5)}...)`,
          groupId: d.groupId,
        }));
    } catch (err) {
      console.warn('Failed to enumerate video devices:', err);
      return [];
    }
  }

  /**
   * Request live camera media stream.
   * Requests both video and audio.
   */
  public static async requestStream(selectedDeviceId?: string): Promise<{
    stream: MediaStream;
    resolution: CameraResolution;
  }> {
    if (!this.isSupported()) {
      throw this.parseError(new Error('UNSUPPORTED'));
    }

    const videoConstraints: MediaTrackConstraints = {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      facingMode: 'user',
    };

    if (selectedDeviceId) {
      videoConstraints.deviceId = { exact: selectedDeviceId };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true, // Audio requested as per user's latest instruction
      });

      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack ? videoTrack.getSettings() : {};

      const resolution: CameraResolution = {
        width: settings.width || 1280,
        height: settings.height || 720,
      };

      return { stream, resolution };
    } catch (err: unknown) {
      throw this.parseError(err);
    }
  }

  /**
   * Safely stop all tracks in a stream
   */
  public static stopStream(stream: MediaStream | null): void {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  /**
   * Maps DOMExceptions to structured user-facing error details
   */
  public static parseError(err: unknown): CameraErrorDetails {
    const errorObj = err as DOMException | Error;
    const name = errorObj.name || errorObj.message;

    switch (name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return {
          code: 'PERMISSION_DENIED',
          title: 'Camera Access Denied',
          message: 'Your browser or device settings blocked access to your camera.',
          suggestion: 'Click the camera/lock icon in your browser address bar to allow camera access, then try again.',
        };
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return {
          code: 'DEVICE_NOT_FOUND',
          title: 'No Camera Detected',
          message: 'No video capture device could be found on your machine or mobile device.',
          suggestion: 'Ensure your web camera is plugged in or connected properly.',
        };
      case 'NotReadableError':
      case 'TrackStartError':
        return {
          code: 'DEVICE_IN_USE',
          title: 'Camera Unavailable',
          message: 'Your camera is already in use by another application or browser tab.',
          suggestion: 'Close software like Zoom, Teams, or Google Meet and click Try Again.',
        };
      case 'UNSUPPORTED':
        return {
          code: 'UNSUPPORTED',
          title: 'Camera Not Supported',
          message: 'Your browser environment does not support WebRTC media capture.',
          suggestion: 'Please upgrade to a modern browser such as Chrome, Firefox, Edge, or Safari.',
        };
      default:
        return {
          code: 'UNKNOWN',
          title: 'Camera Initialization Error',
          message: errorObj.message || 'An unexpected error occurred while requesting video stream.',
          suggestion: 'Reload the page or reconnect your camera device.',
        };
    }
  }
}
