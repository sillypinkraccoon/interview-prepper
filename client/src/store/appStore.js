import { create } from 'zustand';

const useAppStore = create((set) => ({
  // View: 'new' | 'generating' | 'results'
  view: 'new',
  currentSession: null,
  sessions: [],
  isGenerating: false,
  generateError: null,
  lastFormData: null, // for retry
  activeCategoryIndex: 0,
  isExporting: false,
  answers: {}, // { [questionId]: string }

  setView: (view) => set({ view }),
  setCurrentSession: (session) => set({ currentSession: session, view: 'results', activeCategoryIndex: 0, answers: session.answers || {} }),
  setAnswer: (questionId, text) => set(state => ({ answers: { ...state.answers, [questionId]: text } })),
  setSessions: (sessions) => set({ sessions }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setGenerateError: (generateError) => set({ generateError }),
  setLastFormData: (lastFormData) => set({ lastFormData }),
  setActiveCategoryIndex: (activeCategoryIndex) => set({ activeCategoryIndex }),
  setExporting: (isExporting) => set({ isExporting }),

  startNewSession: () => set({ view: 'new', currentSession: null, generateError: null }),
}));

export default useAppStore;
