'use client';

import { create } from 'zustand';
import { assistantApi } from '../api/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
  clearError: () => void;
}

// PII detection patterns for document numbers
const PII_PATTERNS = [
  /\b\d{4}\s?\d{6}\b/g, // Passport number (10 digits)
  /\b\d{2}\s?\d{2}\s?\d{6}\b/g, // Series + number
  /\b\d{12}\b/g, // INN
  /\b\d{11}\b/g, // SNILS
  /\b[А-ЯA-Z]{2}\s?\d{7}\b/gi, // Patent series/number
];

export function detectPII(text: string): boolean {
  return PII_PATTERNS.some((pattern) => pattern.test(text));
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (text: string) => {
    const { messages } = get();

    // Create user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    // Add user message and set loading
    set({
      messages: [...messages, userMessage],
      isLoading: true,
      error: null,
    });

    try {
      // Prepare history for API (last 10 messages for context)
      const history = [...messages, userMessage]
        .slice(-10)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call API
      const response = await assistantApi.chat(text, history);

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  },

  clearHistory: () => {
    set({ messages: [], error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
