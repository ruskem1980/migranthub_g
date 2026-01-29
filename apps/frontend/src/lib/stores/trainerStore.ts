'use client';

import { create } from 'zustand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  estimatedMinutes: number;
  icon: string;
}

export interface MessageFeedback {
  score: 'correct' | 'partial' | 'incorrect';
  comment: string;
  tip?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  feedback?: MessageFeedback;
}

export interface Session {
  id: string;
  scenarioId: string;
  status: 'active' | 'completed';
  messages: Message[];
  finalScore?: number;
  completedAt?: string;
}

interface TrainerState {
  scenarios: Scenario[];
  currentSession: Session | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  fetchScenarios: () => Promise<void>;
  startScenario: (scenarioId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  endSession: () => void;
  clearError: () => void;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  { id: "police-check", title: "Проверка документов полицией", description: "Тренировка общения с полицией", difficulty: 3, estimatedMinutes: 10, icon: "👮" },
  { id: "mfc-visit", title: "Визит в МФЦ", description: "Практика обращения в МФЦ", difficulty: 2, estimatedMinutes: 15, icon: "🏢" },
  { id: "migration-service", title: "Миграционная служба", description: "Визит в миграционную службу", difficulty: 4, estimatedMinutes: 20, icon: "🛂" },
  { id: "employer-talk", title: "Разговор с работодателем", description: "Обсуждение условий труда", difficulty: 2, estimatedMinutes: 10, icon: "💼" },
  { id: "rvp-interview", title: "Собеседование на РВП", description: "Подготовка к РВП", difficulty: 4, estimatedMinutes: 25, icon: "📋" },
  { id: "vnj-interview", title: "Собеседование на ВНЖ", description: "Подготовка к ВНЖ", difficulty: 5, estimatedMinutes: 30, icon: "📗" },
];

export const useTrainerStore = create<TrainerState>((set, get) => ({
  scenarios: [],
  currentSession: null,
  isLoading: false,
  isSending: false,
  error: null,

  fetchScenarios: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/v1/trainer/scenarios`);
      if (!response.ok) { set({ scenarios: DEFAULT_SCENARIOS, isLoading: false }); return; }
      const data = await response.json();
      const scenarios = data.data || data;
      set({ scenarios: Array.isArray(scenarios) && scenarios.length > 0 ? scenarios : DEFAULT_SCENARIOS, isLoading: false });
    } catch { set({ scenarios: DEFAULT_SCENARIOS, isLoading: false }); }
  },

  startScenario: async (scenarioId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/v1/trainer/start`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      if (!response.ok) throw new Error("Failed to start");
      const data = await response.json();
      const sessionData = data.data || data;
      const session: Session = { id: sessionData.sessionId || sessionData.id, scenarioId, status: "active", messages: sessionData.messages || [] };
      if (sessionData.message) {
        session.messages.push({ id: `msg-${Date.now()}`, role: "assistant", content: sessionData.message, timestamp: new Date().toISOString() });
      }
      set({ currentSession: session, isLoading: false });
    } catch (error) { set({ error: error instanceof Error ? error.message : "Не удалось начать", isLoading: false }); }
  },

  sendMessage: async (message: string) => {
    const { currentSession } = get();
    if (!currentSession) return;
    const userMessage: Message = { id: `msg-${Date.now()}`, role: "user", content: message, timestamp: new Date().toISOString() };
    set({ isSending: true, error: null, currentSession: { ...currentSession, messages: [...currentSession.messages, userMessage] } });
    try {
      const response = await fetch(`${API_URL}/api/v1/trainer/message`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentSession.id, message }),
      });
      if (!response.ok) throw new Error("Failed to send");
      const data = await response.json();
      const responseData = data.data || data;
      const assistantMessage: Message = { id: `msg-${Date.now() + 1}`, role: "assistant", content: responseData.message || responseData.content, timestamp: new Date().toISOString(), feedback: responseData.feedback };
      const updatedSession = get().currentSession;
      if (!updatedSession) return;
      const isCompleted = responseData.status === "completed" || responseData.completed;
      set({ isSending: false, currentSession: { ...updatedSession, messages: [...updatedSession.messages, assistantMessage], status: isCompleted ? "completed" : "active", finalScore: responseData.finalScore || responseData.score, completedAt: isCompleted ? new Date().toISOString() : undefined } });
    } catch (error) { set({ error: error instanceof Error ? error.message : "Ошибка отправки", isSending: false }); }
  },

  endSession: () => set({ currentSession: null, error: null }),
  clearError: () => set({ error: null }),
}));

export function getDifficultyStars(difficulty: number): string {
  return "⭐".repeat(Math.min(difficulty, 5));
}
