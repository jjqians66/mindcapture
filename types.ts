export interface Insight {
  id: string;
  createdAt: number;
  transcription: string;
  title: string;
  summary: string;
  tags: string[];
  audioBlob?: Blob; // Optional: keeping audio in memory for playback
}

export enum RecorderState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
}

export interface ProcessingResult {
    transcription: string;
    title: string;
    summary: string;
    tags: string[];
}
