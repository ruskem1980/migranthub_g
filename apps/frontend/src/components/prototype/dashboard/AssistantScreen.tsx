'use client';

import { Mic, Send, Sparkles, UserCheck } from 'lucide-react';
import { useState } from 'react';

export function AssistantScreen() {
  const [message, setMessage] = useState('');

  const quickChips = [
    { label: 'Патент', emoji: '📄' },
    { label: 'РВП', emoji: '🏠' },
    { label: 'Семья', emoji: '👨‍👩‍👧' },
    { label: 'Медицина', emoji: '🏥' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Вопросы</h1>
              <p className="text-sm text-white/80">AI/Lawyer</p>
            </div>
          </div>
        </div>
        
        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 rounded-xl py-3 px-4 transition-all active:scale-98 flex items-center justify-center gap-2">
          <UserCheck className="w-5 h-5" />
          <span className="font-semibold">Нанять живого юриста ($)</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
        {/* Legal Disclaimer */}
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-xs font-semibold text-yellow-900 mb-1">Юридический дисклеймер</p>
              <p className="text-xs text-yellow-800 leading-relaxed">
                Консультации ИИ носят справочный характер. Для юридически значимых решений обращайтесь к лицензированному юристу.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-start mb-4">
          <div className="max-w-[80%] bg-white text-gray-900 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-gray-200">
            <p className="text-sm leading-relaxed">
              Я ИИ-юрист. Знаю все законы РФ. Чем помочь?
            </p>
            <p className="text-xs text-gray-400 mt-1">10:30</p>
          </div>
        </div>
      </div>

      {/* KB Chips */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2 font-medium">База знаний:</p>
        <div className="flex flex-wrap gap-2">
          {quickChips.map((chip, index) => (
            <button
              key={index}
              onClick={() => setMessage(`Расскажи про ${chip.label}`)}
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors active:scale-95 flex items-center gap-1"
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors active:scale-95">
            <Mic className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Задайте вопрос юристу или ИИ..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          
          <button
            disabled={!message.trim()}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              message.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
