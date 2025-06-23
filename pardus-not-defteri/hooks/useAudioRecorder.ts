
import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioData {
  blob: Blob;
  base64: string;
  mimeType: string;
  url: string;
}

interface UseAudioRecorderOutput {
  isRecording: boolean;
  isPaused: boolean; 
  elapsedTime: number;
  audioData: AudioData | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
}

const MIME_TYPES_TO_TRY = [
    'audio/webm;codecs=opus',
    'audio/ogg;codecs=opus',
    'audio/webm',
    'audio/ogg',
    'audio/wav',
    'audio/mp4', 
];

const getSupportedMimeType = (): string => {
    for (const type of MIME_TYPES_TO_TRY) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    console.warn("No preferred MIME type supported, falling back to default or an empty string if MediaRecorder is not supported well.");
    return MIME_TYPES_TO_TRY[2]; 
};


const useAudioRecorder = (): UseAudioRecorderOutput => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  const cleanupTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const resetRecordingState = useCallback(() => {
    setIsRecording(false);
    setIsPaused(false);
    setElapsedTime(0);
    setAudioData(null);
    setError(null);
    audioChunksRef.current = [];
    cleanupTimer();
  }, []);

  const startRecording = useCallback(async () => {
    resetRecordingState();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("getUserMedia not supported on your browser!");
      return;
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeType = getSupportedMimeType();
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: supportedMimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        cleanupTimer();
        stopMediaStream();
        setIsRecording(false); 

        if (audioChunksRef.current.length === 0) {
            console.warn("No audio chunks recorded.");
            setError("No audio was recorded. Please try again.");
            return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });
        const audioUrl = URL.createObjectURL(audioBlob);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setAudioData({
                    blob: audioBlob,
                    base64: base64String,
                    mimeType: supportedMimeType,
                    url: audioUrl,
                });
            };
            reader.onerror = (err) => {
                console.error("Error converting blob to base64:", err);
                setError("Error processing recorded audio.");
            }
        } catch (e) {
            console.error("Exception during audio processing:", e);
            setError("Failed to process audio data.");
        }
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError(`Recording error: ${(event as any).error?.name || 'Unknown error'}`);
        cleanupTimer();
        stopMediaStream();
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      recordingStartTimeRef.current = Date.now();
      
      timerIntervalRef.current = setInterval(() => {
        const currentElapsedTime = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setElapsedTime(currentElapsedTime);
        // Removed max duration check: recording continues until stopRecording() is called
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      let message = "Failed to start recording.";
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          message = "Microphone access denied. Please allow microphone permission in your browser settings.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          message = "No microphone found. Please connect a microphone.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          message = "Microphone is already in use or cannot be accessed.";
        }
      }
      setError(message);
      setIsRecording(false);
      stopMediaStream(); 
    }
  }, [resetRecordingState]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    cleanupTimer(); 
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    resetRecordingState();
    if (audioData?.url) {
        URL.revokeObjectURL(audioData.url);
    }
  }, [isRecording, stopRecording, resetRecordingState, audioData]);
  
  useEffect(() => {
    return () => {
      cleanupTimer();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      stopMediaStream();
      if (audioData?.url) {
        URL.revokeObjectURL(audioData.url);
      }
    };
  }, [audioData]);

  return { isRecording, isPaused, elapsedTime, audioData, error, startRecording, stopRecording, resetRecording };
};

export default useAudioRecorder;
