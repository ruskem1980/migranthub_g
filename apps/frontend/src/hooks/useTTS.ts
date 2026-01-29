'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useLanguageStore, type Language } from '@/lib/i18n';

// Language code mapping for TTS engines
// Web Speech API and Capacitor TTS use different locale formats
const LANGUAGE_VOICE_MAP: Record<Language, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  uz: 'uz-UZ',
  tg: 'tg-TJ',
  ky: 'ky-KG',
};

// Fallback languages if primary language voice is not available
const FALLBACK_LANGUAGES: Record<Language, string[]> = {
  ru: ['ru-RU', 'ru'],
  en: ['en-US', 'en-GB', 'en'],
  uz: ['uz-UZ', 'uz', 'ru-RU'], // Fallback to Russian if Uzbek not available
  tg: ['tg-TJ', 'tg', 'ru-RU'], // Fallback to Russian if Tajik not available
  ky: ['ky-KG', 'ky', 'ru-RU'], // Fallback to Russian if Kyrgyz not available
};

interface UseTTSReturn {
  speak: (text: string, lang?: Language) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isSpeaking: boolean;
  error: string | null;
}

/**
 * Text-to-Speech hook that works on both web and mobile platforms.
 *
 * - On web: Uses Web Speech API (SpeechSynthesis)
 * - On mobile (Capacitor): Uses @capacitor-community/text-to-speech
 *
 * Automatically uses the current app language from i18n store if no language specified.
 */
export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentLanguage = useLanguageStore((state) => state.language);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check TTS support on mount
  useEffect(() => {
    const checkSupport = async () => {
      if (Capacitor.isNativePlatform()) {
        // On native, assume TTS is supported (will fail gracefully if not)
        setIsSupported(true);
      } else {
        // On web, check for SpeechSynthesis API
        setIsSupported('speechSynthesis' in window);
      }
    };

    checkSupport();
  }, []);

  // Find the best available voice for a language (web only)
  const findVoice = useCallback((lang: Language): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return null;
    }

    const voices = window.speechSynthesis.getVoices();
    const fallbacks = FALLBACK_LANGUAGES[lang];

    for (const fallbackLang of fallbacks) {
      const voice = voices.find(
        (v) => v.lang.startsWith(fallbackLang) || v.lang === fallbackLang
      );
      if (voice) {
        return voice;
      }
    }

    // Return first available voice as last resort
    return voices[0] || null;
  }, []);

  // Speak text using Web Speech API
  const speakWeb = useCallback(
    async (text: string, lang: Language): Promise<void> => {
      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis not supported');
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Set language
        utterance.lang = LANGUAGE_VOICE_MAP[lang];

        // Try to find a matching voice
        const voice = findVoice(lang);
        if (voice) {
          utterance.voice = voice;
        }

        // Configure speech parameters
        utterance.rate = 0.9; // Slightly slower for better comprehension
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setError(null);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
          resolve();
        };

        utterance.onerror = (event) => {
          setIsSpeaking(false);
          utteranceRef.current = null;

          // Don't treat 'interrupted' as an error (happens when stop() is called)
          if (event.error === 'interrupted' || event.error === 'canceled') {
            resolve();
          } else {
            const errorMessage = `Speech error: ${event.error}`;
            setError(errorMessage);
            reject(new Error(errorMessage));
          }
        };

        // Workaround for voices not loaded on first call
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            const voice = findVoice(lang);
            if (voice) {
              utterance.voice = voice;
            }
            window.speechSynthesis.speak(utterance);
          }, { once: true });
        } else {
          window.speechSynthesis.speak(utterance);
        }
      });
    },
    [findVoice]
  );

  // Speak text using Capacitor TextToSpeech
  const speakNative = useCallback(
    async (text: string, lang: Language): Promise<void> => {
      try {
        // Dynamic import to avoid bundling issues on web
        const { TextToSpeech } = await import('@capacitor-community/text-to-speech');

        setIsSpeaking(true);
        setError(null);

        await TextToSpeech.speak({
          text,
          lang: LANGUAGE_VOICE_MAP[lang],
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0,
          category: 'playback', // iOS: allows audio to play even in silent mode
        });

        setIsSpeaking(false);
      } catch (err) {
        setIsSpeaking(false);
        const errorMessage = err instanceof Error ? err.message : 'TTS error';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  // Main speak function
  const speak = useCallback(
    async (text: string, lang?: Language): Promise<void> => {
      if (!text.trim()) {
        return;
      }

      const language = lang || currentLanguage;

      try {
        if (Capacitor.isNativePlatform()) {
          await speakNative(text, language);
        } else {
          await speakWeb(text, language);
        }
      } catch (err) {
        // Error is already handled in speakWeb/speakNative
        console.error('TTS speak error:', err);
      }
    },
    [currentLanguage, speakNative, speakWeb]
  );

  // Stop speech
  const stop = useCallback(() => {
    if (Capacitor.isNativePlatform()) {
      // Dynamic import for native
      import('@capacitor-community/text-to-speech').then(({ TextToSpeech }) => {
        TextToSpeech.stop();
      }).catch(console.error);
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    utteranceRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    isSupported,
    isSpeaking,
    error,
  };
}

export type UseTTSReturn = ReturnType<typeof useTTS>;
