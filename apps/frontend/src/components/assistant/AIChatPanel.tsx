'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Trash2, AlertTriangle, Bot, User } from 'lucide-react';
import { useChatStore, detectPII, type ChatMessage } from '@/lib/stores/chatStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

// Message Bubble Component
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const { t } = useTranslation();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">{t('assistant.chat.sources')}:</p>
            <ul className="text-xs text-blue-600">
              {message.sources.map((source, idx) => (
                <li key={idx}>{source}</li>
              ))}
            </ul>
          </div>
        )}

        <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>

      {/* Avatar for user */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}

// PII Warning Component
function PIIWarning({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="mx-4 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-in slide-in-from-bottom duration-200">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-amber-800 font-medium">{t('assistant.chat.piiWarningTitle')}</p>
          <p className="text-xs text-amber-700 mt-1">{t('assistant.chat.piiWarningText')}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-amber-600 hover:text-amber-800 text-xs underline"
        >
          {t('common.ok')}
        </button>
      </div>
    </div>
  );
}

// Main AIChatPanel Component
export function AIChatPanel() {
  const { t } = useTranslation();
  const { messages, isLoading, error, sendMessage, clearHistory, clearError } = useChatStore();

  const [inputMessage, setInputMessage] = useState('');
  const [showPIIWarning, setShowPIIWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for PII in input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    // Detect PII
    if (detectPII(value) && !showPIIWarning) {
      setShowPIIWarning(true);
    }
  }, [showPIIWarning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setShowPIIWarning(false);
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowPIIWarning(false);
  };

  // Quick question chips
  const quickQuestions = [
    t('assistant.quickChips.patent'),
    t('assistant.quickChips.registration'),
    t('assistant.quickChips.documents'),
  ];

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    sendMessage(question);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('assistant.chat.title')}</h3>
            <p className="text-xs text-gray-500">{t('assistant.chat.subtitle')}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title={t('assistant.chat.clearHistory')}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">{t('assistant.chat.emptyTitle')}</h4>
            <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
              {t('assistant.chat.emptyDescription')}
            </p>

            {/* Quick questions */}
            <div className="flex flex-wrap justify-center gap-2">
              {quickQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(question)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white text-gray-900 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-500">{t('assistant.thinking')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-auto max-w-xs p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-xs text-red-500 underline hover:text-red-700"
            >
              {t('common.close')}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* PII Warning */}
      {showPIIWarning && <PIIWarning onDismiss={() => setShowPIIWarning(false)} />}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
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
