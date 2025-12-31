import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RecorderState, ProcessingResult } from '../types';
import { processAudioInsight } from '../services/geminiService';
import Visualizer from './Visualizer';

interface RecorderProps {
  onInsightGenerated: (result: ProcessingResult, audioBlob: Blob) => void;
}

const MAX_DURATION_SEC = 30;

const Recorder: React.FC<RecorderProps> = ({ onInsightGenerated }) => {
  const [recorderState, setRecorderState] = useState<RecorderState>(RecorderState.IDLE);
  const [timeLeft, setTimeLeft] = useState(MAX_DURATION_SEC);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        processRecording(blob);
        
        // Cleanup stream
        audioStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start();
      setRecorderState(RecorderState.RECORDING);
      setTimeLeft(MAX_DURATION_SEC);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecorderState(RecorderState.PROCESSING);
    }
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const processRecording = async (blob: Blob) => {
    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.onerror = () => {
        console.error("FileReader error");
        alert("Failed to read audio file. Please try again.");
        setRecorderState(RecorderState.IDLE);
      };
      
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          if (!base64String) {
            throw new Error("Failed to convert audio to base64");
          }
          
          // Remove data URL prefix (e.g., "data:audio/webm;base64,")
          const base64Data = base64String.split(',')[1];
          if (!base64Data) {
            throw new Error("Invalid base64 data");
          }
          
          console.log("Processing audio with Gemini API...");
          const result = await processAudioInsight(base64Data, blob.type);
          console.log("Processing successful:", result);
          onInsightGenerated(result, blob);
          setRecorderState(RecorderState.IDLE);
        } catch (error: any) {
          console.error("Processing failed:", error);
          const errorMessage = error?.message || "Unknown error occurred";
          alert(`Failed to process audio: ${errorMessage}\n\nPlease check:\n1. Your Gemini API key is set correctly\n2. You have API quota remaining\n3. Your internet connection is working`);
          setRecorderState(RecorderState.IDLE);
        }
      };
      
      reader.readAsDataURL(blob);
    } catch (error: any) {
      console.error("Processing failed", error);
      alert(`Failed to process audio: ${error?.message || "Unknown error"}\n\nPlease check your API key and try again.`);
      setRecorderState(RecorderState.IDLE);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (recorderState === RecorderState.RECORDING) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressPercentage = ((MAX_DURATION_SEC - timeLeft) / MAX_DURATION_SEC) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
      
      {/* Visualizer Area */}
      <div className="relative w-full h-32 bg-surface rounded-xl overflow-hidden mb-6 border border-slate-700 shadow-inner flex items-center justify-center">
        {recorderState === RecorderState.RECORDING ? (
          <Visualizer stream={stream} isRecording={true} />
        ) : recorderState === RecorderState.PROCESSING ? (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-accent text-sm font-medium">Analyzing Research...</span>
          </div>
        ) : (
          <span className="text-slate-500 text-sm">Ready to capture</span>
        )}
      </div>

      {/* Main Action Button */}
      <div className="relative group">
        {/* Progress Ring Background */}
        {recorderState === RecorderState.RECORDING && (
           <svg className="absolute -top-2 -left-2 w-20 h-20 transform -rotate-90 pointer-events-none">
             <circle
               cx="40"
               cy="40"
               r="36"
               stroke="currentColor"
               strokeWidth="4"
               fill="transparent"
               className="text-slate-700"
             />
             <circle
               cx="40"
               cy="40"
               r="36"
               stroke="currentColor"
               strokeWidth="4"
               fill="transparent"
               strokeDasharray={226}
               strokeDashoffset={226 - (226 * progressPercentage) / 100}
               className="text-red-500 transition-all duration-1000 ease-linear"
             />
           </svg>
        )}

        <button
          onClick={recorderState === RecorderState.RECORDING ? stopRecording : startRecording}
          disabled={recorderState === RecorderState.PROCESSING}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
            ${recorderState === RecorderState.RECORDING 
              ? 'bg-red-500 hover:bg-red-600 scale-90' 
              : 'bg-primary hover:bg-indigo-500 hover:scale-105'
            }
            ${recorderState === RecorderState.PROCESSING ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {recorderState === RecorderState.RECORDING ? (
            <div className="w-6 h-6 bg-white rounded-md" /> // Stop Icon
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-4 text-center">
        {recorderState === RecorderState.RECORDING ? (
             <p className="text-red-400 font-mono text-lg font-bold">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</p>
        ) : (
             <p className="text-slate-400 text-sm">Tap to record (Max 30s)</p>
        )}
      </div>
    </div>
  );
};

export default Recorder;