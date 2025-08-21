import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PredictionResponse {
  [key: string]: any; // Flexible structure for API response
}

interface PredictionStore {
  predictionData: PredictionResponse | null;
  isLoading: boolean;
  error: string | null;
  setPredictionData: (data: PredictionResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearData: () => void;
}

export const usePredictionStore = create<PredictionStore>()(
  persist(
    (set, get) => ({
      predictionData: null,
      isLoading: false,
      error: null,
      
      setPredictionData: (data: PredictionResponse) => 
        set({ predictionData: data, error: null }),
      
      setLoading: (loading: boolean) => 
        set({ isLoading: loading }),
      
      setError: (error: string | null) => 
        set({ error, isLoading: false }),
      
      clearData: () => 
        set({ predictionData: null, error: null, isLoading: false }),
    }),
    {
      name: 'prediction-store', // localStorage key
      partialize: (state) => ({ 
        predictionData: state.predictionData 
      }), // Only persist predictionData
    }
  )
);