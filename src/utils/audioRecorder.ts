import { useState, useRef, useEffect, useCallback } from 'react';

export interface RecordedAudioResult {
  data: string; // Base64-encoded audio
  mimeType: string;
  duration: number; // Duration in seconds
  blobUrl: string;
  name: string;
}

/**
 * Safely converts an uploaded audio file (mp3, wav, m4a, ogg, webm, etc.)
 * into a RecordedAudioResult so it can be previewed and sent to the Gemini API.
 */
export async function convertAudioFileToResult(file: File): Promise<RecordedAudioResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const resultStr = reader.result as string;
        const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
        const blobUrl = URL.createObjectURL(file);

        // Best effort to extract duration
        const tempAudio = new Audio();
        tempAudio.src = blobUrl;
        tempAudio.onloadedmetadata = () => {
          resolve({
            data: base64Data,
            mimeType: file.type || 'audio/webm',
            duration: Math.round((tempAudio.duration || 1) * 10) / 10,
            blobUrl,
            name: file.name,
          });
        };
        tempAudio.onerror = () => {
          resolve({
            data: base64Data,
            mimeType: file.type || 'audio/webm',
            duration: 1,
            blobUrl,
            name: file.name,
          });
        };
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const resolvePromiseRef = useRef<((value: RecordedAudioResult | null) => void) | null>(null);

  // Stop media stream tracks safely
  const stopStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopStream();
    };
  }, [stopStream]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);
    chunksRef.current = [];

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Microphone access is not supported by this browser environment. You can upload an audio file instead.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Select optimal supported audio MIME type
      let chosenMimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          chosenMimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          chosenMimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          chosenMimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          chosenMimeType = 'audio/ogg;codecs=opus';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType: chosenMimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const totalDuration = Math.max(0.5, (Date.now() - startTimeRef.current) / 1000);
        const finalBlob = new Blob(chunksRef.current, { type: chosenMimeType });
        stopStream();

        const reader = new FileReader();
        reader.onloadend = () => {
          const resultStr = reader.result as string;
          const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
          const blobUrl = URL.createObjectURL(finalBlob);

          const result: RecordedAudioResult = {
            data: base64Data,
            mimeType: chosenMimeType,
            duration: Math.round(totalDuration * 10) / 10,
            blobUrl,
            name: `voice_message_${Date.now()}.webm`,
          };

          if (resolvePromiseRef.current) {
            resolvePromiseRef.current(result);
            resolvePromiseRef.current = null;
          }
        };

        reader.onerror = () => {
          if (resolvePromiseRef.current) {
            resolvePromiseRef.current(null);
            resolvePromiseRef.current = null;
          }
        };

        reader.readAsDataURL(finalBlob);
      };

      recorder.onerror = (e: any) => {
        console.warn('MediaRecorder warning:', e);
        setError('Recording encountered an issue. You can try again or upload an audio file.');
        stopStream();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (resolvePromiseRef.current) {
          resolvePromiseRef.current(null);
          resolvePromiseRef.current = null;
        }
      };

      recorder.start(250); // Collect slice every 250ms
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);

      return true;
    } catch (err: any) {
      // Gracefully handle denied permissions and device errors without throwing uncaught console errors
      const errName = err?.name || '';
      const errMsg = err?.message || '';

      if (
        errName === 'NotAllowedError' ||
        errName === 'PermissionDeniedError' ||
        errMsg.toLowerCase().includes('permission denied')
      ) {
        setError('Microphone permission was denied. You can allow it in browser settings or upload an audio file.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setError('No microphone found on this device. You can upload an audio file instead.');
      } else if (errName === 'SecurityError') {
        setError('Microphone access is restricted by iframe/browser security. You can upload an audio file instead.');
      } else {
        setError('Could not access microphone: ' + (errMsg || 'Please check browser permissions.'));
      }
      stopStream();
      return false;
    }
  }, [stopStream]);

  const stopRecording = useCallback((): Promise<RecordedAudioResult | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        stopStream();
        resolve(null);
        return;
      }

      resolvePromiseRef.current = resolve;
      setIsRecording(false);

      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('Recorder stop warning:', err);
        stopStream();
        resolve(null);
      }
    });
  }, [stopStream]);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    chunksRef.current = [];
    resolvePromiseRef.current = null;
    setIsRecording(false);
    setDuration(0);
    setError(null);
    stopStream();
  }, [stopStream]);

  return {
    isRecording,
    duration,
    error,
    clearError,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
