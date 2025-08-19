import { create } from 'zustand';
import type { ImageEncodeFormat } from '../services/image-encoder';

type AvailableFormatsState = {
  availableFormats: ImageEncodeFormat[];
  setAvailableFormats: (formats: ImageEncodeFormat[]) => void;
};

export const useAvailableFormatsStore = create<AvailableFormatsState>((set) => ({
  availableFormats: [],
  setAvailableFormats: (formats) => {
    set({ availableFormats: formats });
  },
}));
