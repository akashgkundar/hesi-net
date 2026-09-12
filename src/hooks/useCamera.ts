import { useState, useCallback, useEffect, useRef } from 'react';
import type { CameraDeviceInfo, CameraErrorDetails, CameraResolution, CameraStatus } from '../types/camera';
import { CameraService } from '../services/cameraService';

export function useCamera() {
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [resolution, setResolution] = useState<CameraResolution | null>(null);
  const [error, setError] = useState<CameraErrorDetails | null>(null);
  const [cameras, setCameras] = useState<CameraDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const streamRef = useRef<MediaStream | null>(null);

  // Load available camera devices
  const refreshDevices = useCallback(async () => {
    const devices = await CameraService.getAvailableCameras();
    setCameras(devices);
    if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].deviceId);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Request & Start camera stream
  const startCamera = useCallback(async (overrideDeviceId?: string) => {
    setError(null);
    setStatus('requesting');

    const targetDevice = overrideDeviceId || selectedDeviceId;

    try {
      // Stop current stream if existing
      if (streamRef.current) {
        CameraService.stopStream(streamRef.current);
        streamRef.current = null;
      }

      const { stream: newStream, resolution: newRes } = await CameraService.requestStream(targetDevice);
      
      streamRef.current = newStream;
      setStream(newStream);
      setResolution(newRes);
      setStatus('active');

      // Refresh devices to populate full labels after permission granted
      refreshDevices();
    } catch (err) {
      const errorDetails = err as CameraErrorDetails;
      setError(errorDetails);
      setStatus(errorDetails.code === 'PERMISSION_DENIED' ? 'denied' : 'error');
      setStream(null);
      setResolution(null);
    }
  }, [selectedDeviceId, refreshDevices]);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      CameraService.stopStream(streamRef.current);
      streamRef.current = null;
    }
    setStream(null);
    setResolution(null);
    setStatus('stopped');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        CameraService.stopStream(streamRef.current);
      }
    };
  }, []);

  return {
    status,
    setStatus,
    stream,
    resolution,
    error,
    cameras,
    selectedDeviceId,
    setSelectedDeviceId,
    startCamera,
    stopCamera,
    refreshDevices,
  };
}
