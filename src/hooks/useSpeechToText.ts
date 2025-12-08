import { useState, useCallback } from "react";
import { useAudioRecorder } from "./useAudioRecorder";

interface UseVoiceAssistantReturn {
  isRecording: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopAndPlay: () => Promise<void>;
}

export const useVoiceAssistant = (): UseVoiceAssistantReturn => {
  const { isRecording, startRecording, stopRecording, error: recorderError } = useAudioRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopAndPlay = useCallback(async (): Promise<void> => {
    setError(null);
    
    const audioBlob = await stopRecording();
    
    if (!audioBlob) {
      setError("No audio recorded");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Voice request failed: ${response.status}`);
      }

      const mp3Blob = await response.blob();
      const audioUrl = URL.createObjectURL(mp3Blob);
      const audio = new Audio(audioUrl);
      
      setIsProcessing(false);
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setError("Failed to play audio");
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Voice request failed";
      setError(errorMessage);
      console.error("Voice error:", err);
      setIsProcessing(false);
    }
  }, [stopRecording]);

  return {
    isRecording,
    isProcessing,
    isPlaying,
    error: error || recorderError,
    startRecording,
    stopAndPlay,
  };
};
