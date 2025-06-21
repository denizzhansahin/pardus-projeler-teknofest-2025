
import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechRecognitionHook } from '../types';

const RECORDING_DURATION_SECONDS = 15;

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [finalRecordingDuration, setFinalRecordingDuration] = useState<number | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);


  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);
  
  const cleanupRecorderState = useCallback(() => {
    // Only resets state variables, not the recorder/stream itself yet
    setIsListening(false);
    setCountdown(null);
    audioChunksRef.current = [];
    // setRecordedAudio(null); // Keep recordedAudio until it's consumed or explicitly reset by resetRecorder
    // setFinalRecordingDuration(null); // Keep duration until explicit reset
  }, []);


  const requestPermission = useCallback(async () => {
    setError(null); // Clear previous errors before requesting
    try {
      const permissionStatusQuery = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (permissionStatusQuery.state === 'denied') {
         setError("Mikrofon izni reddedildi. Lütfen tarayıcı ayarlarınızdan etkinleştirin ve sayfayı yenileyin.");
         setHasPermission(false);
         return false; // Indicate failure
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, only for permission check
      setHasPermission(true);
      setError(null); 
      return true; // Indicate success
    } catch (err: any) {
      console.error("Mikrofon izni hatası:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Mikrofon izni reddedildi. Lütfen tarayıcı ayarlarınızdan mikrofon erişimini etkinleştirin.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("Mikrofon bulunamadı. Lütfen bir mikrofonun bağlı ve etkin olduğundan emin olun.");
      } else {
        setError("Mikrofon erişimi sağlanamadı. Hata: " + err.message);
      }
      setHasPermission(false);
      return false; // Indicate failure
    }
  }, []);
  
  const fullyCleanupRecorderAndStream = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop(); 
    }
    clearTimer();
    stopStream();
    mediaRecorderRef.current = null;
    audioChunksRef.current = []; // Ensure chunks are cleared here too
  }, [clearTimer, stopStream]);

  useEffect(() => {
    return () => {
      fullyCleanupRecorderAndStream();
    };
  }, [fullyCleanupRecorderAndStream]);


  const startListening = useCallback(async () => {
    if (isListening) return;
    
    setRecordedAudio(null); // Clear previous recording
    setFinalRecordingDuration(null); // Clear previous duration
    setError(null); // Clear previous operational errors

    let currentPermission = hasPermission;
    if (currentPermission !== true) {
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        // Error state should be set by requestPermission
        return;
      }
      currentPermission = true; // requestPermission was successful
    }
    
    // This check is slightly redundant if requestPermission worked, but good as a safeguard
    if (currentPermission !== true) {
        // This case should ideally be caught by requestPermission setting an error
        if(!error) setError("Mikrofon izni gereklidir.");
        return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const options = { mimeType: 'audio/webm' }; 
      // Fallback if webm is not supported (rare for modern browsers)
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(`${options.mimeType} desteklenmiyor, varsayılan deneniyor.`);
        // @ts-ignore
        delete options.mimeType;
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = []; // Reset chunks for new recording

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedAudio(audioBlob);
        
        if (recordingStartTimeRef.current) {
            const endTime = Date.now();
            const duration = Math.round((endTime - recordingStartTimeRef.current) / 1000);
            setFinalRecordingDuration(duration);
        } else {
            // Fallback if startTime wasn't set, calculate from countdown
            const durationFromCountdown = countdown !== null ? RECORDING_DURATION_SECONDS - countdown : 0;
            setFinalRecordingDuration(Math.max(0, durationFromCountdown));
        }
        
        // Don't call fullyCleanupRecorderAndStream here, as stream is needed until Blob is processed.
        // Stream tracks are stopped, but MediaRecorder object might still be needed for mimetype.
        stopStream(); // Stop tracks once recording is done.
        cleanupRecorderState(); // Reset listening state variables
      };
      
      mediaRecorderRef.current.onerror = (event: Event) => {
        console.error("MediaRecorder hatası:", event);
        setError("Kayıt sırasında hata oluştu.");
        fullyCleanupRecorderAndStream();
        cleanupRecorderState();
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      recordingStartTimeRef.current = Date.now();
      setCountdown(RECORDING_DURATION_SECONDS);

      clearTimer(); // Clear any existing timer
      timerRef.current = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown === null || prevCountdown <= 1) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop(); 
            }
            clearTimer(); // Stop this interval
            return 0; // Show 0 at the end
          }
          return prevCountdown - 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error("Kayıt başlatma hatası:", err);
      setError(`Kayıt başlatma hatası: ${err.message}`);
      fullyCleanupRecorderAndStream();
      cleanupRecorderState();
      // Check if this error was due to permission revocation during the process
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'SecurityError') {
        setHasPermission(false); // Update permission state
      }
    }
  }, [isListening, hasPermission, requestPermission, error, clearTimer, fullyCleanupRecorderAndStream, cleanupRecorderState, countdown]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); // This will trigger onstop, then cleanupRecorderState
    } else {
      // If not actively recording but called (e.g. manual cleanup)
      fullyCleanupRecorderAndStream();
      cleanupRecorderState();
       if (recordingStartTimeRef.current && finalRecordingDuration === null) { 
          const endTime = Date.now();
          setFinalRecordingDuration(Math.round((endTime - recordingStartTimeRef.current) / 1000));
       }
    }
    clearTimer(); // Always clear timer on stop
  }, [fullyCleanupRecorderAndStream, cleanupRecorderState, finalRecordingDuration, clearTimer]);

  const resetRecorder = useCallback(() => {
    // This is for explicitly clearing a completed/failed recording attempt's data
    setError(null);
    setRecordedAudio(null);
    setFinalRecordingDuration(null);
    setCountdown(null); // Reset countdown display
    fullyCleanupRecorderAndStream(); // Ensure all hardware resources are released
    cleanupRecorderState(); // Reset all state flags
  }, [fullyCleanupRecorderAndStream, cleanupRecorderState]);

  return {
    isListening,
    error,
    hasPermission,
    countdown,
    finalRecordingDuration,
    recordedAudio,
    startListening,
    stopListening,
    resetRecorder,
    requestPermission,
  };
};

export default useSpeechRecognition;