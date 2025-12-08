import { useState, useCallback } from "react";
import { useAudioRecorder } from "./useAudioRecorder";

interface UseSpeechToTextReturn {
  isRecording: boolean;
  isProcessing: boolean;
  transcribedText: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopAndTranscribe: () => Promise<string | null>;
}

export const useSpeechToText = (): UseSpeechToTextReturn => {
  const { isRecording, startRecording, stopRecording, error: recorderError } = useAudioRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopAndTranscribe = useCallback(async (): Promise<string | null> => {
    setError(null);
    
    const audioBlob = await stopRecording();
    
    if (!audioBlob) {
      setError("No audio recorded");
      return null;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch("/api/asr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ASR request failed: ${response.status}`);
      }

      const data = await response.json();
      const text = data.text || "";
      
      setTranscribedText(text);
      return text;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transcription failed";
      setError(errorMessage);
      console.error("Transcription error:", err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [stopRecording]);

  return {
    isRecording,
    isProcessing,
    transcribedText,
    error: error || recorderError,
    startRecording,
    stopAndTranscribe,
  };
};
