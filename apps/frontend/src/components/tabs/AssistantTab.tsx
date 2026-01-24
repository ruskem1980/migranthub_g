'use client';

import { Mic, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

const quickChips = [
  'Как получить патент?',
  'Правила ввоза семьи',
  'Штрафы за нарушения',
  'Продление регистрации',
];

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export function AssistantTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Здравствуйте! Я ваш AI-ассистент по миграционным вопросам. Чем могу помочь?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Спасибо за ваш вопрос! Я обрабатываю информацию и скоро отвечу.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  const handleChipClick = (chip: string) => {
    setInputValue(chip);
  };

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Ассистент</h1>
              <p className="text-sm text-white/80">Юридическая поддержка 24/7</p>
            </div>
          </div>
          <LanguageSwitcher variant="compact" className="bg-white/20 hover:bg-white/30 text-white" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'mb-4 flex',
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
              )}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p
                className={cn(
                  'text-xs mt-1',
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                )}
              >
                {message.timestamp.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Chips */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2 font-medium">Быстрые вопросы:</p>
          <div className="flex flex-wrap gap-2">
            {quickChips.map((chip, index) => (
              <button
                key={index}
                onClick={() => handleChipClick(chip)}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors active:scale-95"
            aria-label="Голосовой ввод"
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Задайте вопрос юристу или ИИ..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95',
              inputValue.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
            aria-label="Отправить"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
