import { create } from 'zustand';

interface StoreState {
  introFinished: boolean;
  setIntroFinished: (finished: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  introFinished: false,
  setIntroFinished: (finished) => set({ introFinished: finished }),
}));
