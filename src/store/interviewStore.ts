import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the structure for a single candidate
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  summary: string;
  transcript: Array<{ question: string; answer: string }>;
}

// Define the state for the entire application
interface InterviewState {
  // For the ongoing interview session
  interviewStatus: 'idle' | 'collecting_info' | 'in_progress' | 'completed';
  currentCandidateInfo: { name: string; email: string; phone: string; };
  currentTranscript: Array<{ question: string; answer: string }>;
  
  // To store all completed interviews
  candidates: Candidate[];
  
  // Actions to manage the state
  setCandidateInfo: (info: Partial<InterviewState['currentCandidateInfo']>) => void;
  startInfoCollection: () => void;
  startInterview: (info: { name: string; email: string; phone: string; }) => void;
  addTranscriptEntry: (entry: { question: string; answer: string }) => void;
  addCandidate: (result: { score: number; summary: string }) => void;
  resetCurrentSession: () => void;
  clearAllHistory: () => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      interviewStatus: 'idle',
      currentCandidateInfo: { name: '', email: '', phone: '' },
      currentTranscript: [],
      candidates: [],
      
      setCandidateInfo: (info) => set((state) => ({ 
        currentCandidateInfo: { ...state.currentCandidateInfo, ...info } 
      })),
      
      startInfoCollection: () => set({ interviewStatus: 'collecting_info' }),

      startInterview: (info) => set({
        interviewStatus: 'in_progress',
        currentTranscript: [],
        currentCandidateInfo: info,
      }),

      addTranscriptEntry: (entry) => set((state) => ({ 
        currentTranscript: [...state.currentTranscript, entry] 
      })),
      
      addCandidate: (result) => {
        const { currentCandidateInfo, currentTranscript, candidates } = get();
        const newCandidate: Candidate = {
          id: new Date().toISOString(), // Simple unique ID
          ...currentCandidateInfo,
          ...result,
          transcript: currentTranscript,
        };
        set({ 
          candidates: [...candidates, newCandidate],
          interviewStatus: 'completed' 
        });
      },

      resetCurrentSession: () => set({
        interviewStatus: 'idle',
        currentCandidateInfo: { name: '', email: '', phone: '' },
        currentTranscript: [],
      }),
      clearAllHistory: () => set({ candidates: [] })
    }),
    {
      name: 'interview-storage-multi', // New name to avoid conflicts with old structure
    }
  )
);