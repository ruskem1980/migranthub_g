'use client';

import { Loader2, Mic, Send, Sparkles, UserCheck, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  blocked?: boolean;
  timestamp: Date;
}

interface AssistantResponse {
  sessionId: string;
  message: string;
  blocked?: boolean;
  blockReason?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function AssistantScreen() {
  const { t, locale } = useTranslation();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickChips = [
    { label: t('assistant.quickChips.patent'), emoji: '📄' },
    { label: t('assistant.quickChips.registration'), emoji: '🏠' },
    { label: t('assistant.quickChips.documents'), emoji: '📋' },
    { label: t('assistant.quickChips.ban'), emoji: '🛡️' },
  ];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/assistant/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText.trim(),
          sessionId,
          language: locale,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AssistantResponse = await response.json();

      // Save session ID for future messages
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        blocked: data.blocked,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);

      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: t('assistant.error') || 'Sorry, there was an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleChipClick = (chipLabel: string) => {
    sendMessage(chipLabel);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white relative z-20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t('assistant.title')}</h1>
              <p className="text-sm text-white/80">{t('assistant.subtitle')}</p>
            </div>
          </div>
          <LanguageSwitcher variant="compact" className="bg-white/20 hover:bg-white/30" />
        </div>

        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 rounded-xl py-3 px-4 transition-all active:scale-98 flex items-center justify-center gap-2">
          <UserCheck className="w-5 h-5" />
          <span className="font-semibold">{t('sos.lawyer')} ($)</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 bg-gray-50">
        {/* Legal Disclaimer */}
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-xs font-semibold text-yellow-900 mb-1">{t('sos.legalHelp.title')}</p>
              <p className="text-xs text-yellow-800 leading-relaxed">
                {t('sos.legalHelp.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Initial greeting if no messages */}
        {messages.length === 0 && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%] bg-white text-gray-900 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-gray-200">
              <p className="text-sm leading-relaxed">
                {t('assistant.greeting')}
              </p>
              <p className="text-xs text-gray-400 mt-1">{formatTime(new Date())}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : msg.blocked
                  ? 'bg-amber-50 text-gray-900 rounded-bl-sm border-2 border-amber-300'
                  : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
              }`}
            >
              {msg.blocked && (
                <div className="flex items-center gap-1 mb-2 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-semibold">{t('assistant.blocked') || 'Restricted topic'}</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                }`}
              >
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%] bg-white text-gray-900 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-gray-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-500">{t('assistant.thinking') || 'Thinking...'}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* KB Chips - only show if no messages yet or after first response */}
      {(messages.length === 0 || messages.length > 0) && !isLoading && (
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2 font-medium">{t('assistant.quickQuestions.title')}:</p>
          <div className="flex flex-wrap gap-2">
            {quickChips.map((chip, index) => (
              <button
                key={index}
                onClick={() => handleChipClick(chip.label)}
                disabled={isLoading}
                className={`px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium transition-colors active:scale-95 flex items-center gap-1 ${
                  isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-100'
                }`}
              >
                <span>{chip.emoji}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors active:scale-95"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t('assistant.placeholder')}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              inputMessage.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
