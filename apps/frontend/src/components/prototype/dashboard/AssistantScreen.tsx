'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Send, ArrowLeft, CheckCircle, AlertCircle, XCircle, Clock, Star, GraduationCap, Trophy, Shield, Calculator, Hash } from 'lucide-react';
import { useTrainerStore, getDifficultyStars, type Scenario, type Message } from '@/lib/stores/trainerStore';

// Quick Actions for ScenarioSelectionScreen
const quickActions = [
  { id: 'check-docs', label: 'Проверить документы', labelEn: 'Check docs', icon: Shield },
  { id: 'calc-patent', label: 'Рассчитать патент', labelEn: 'Calc patent', icon: Calculator },
  { id: 'find-inn', label: 'Найти ИНН', labelEn: 'Find INN', icon: Hash },
];

// Scenario Selection Screen
function ScenarioSelectionScreen() {
  const { scenarios, isLoading, error, fetchScenarios, startScenario } = useTrainerStore();

  useEffect(() => {
    if (scenarios.length === 0) {
      fetchScenarios();
    }
  }, [scenarios.length, fetchScenarios]);

  const handleStartScenario = async (scenarioId: string) => {
    await startScenario(scenarioId);
  };

  if (isLoading && scenarios.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-500">Загрузка сценариев...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Тренажёр</h1>
            <p className="text-sm text-white/80">Практикуйте реальные ситуации</p>
          </div>
        </div>
        <p className="text-sm text-white/90 leading-relaxed">
          Выберите сценарий для тренировки. AI будет играть роль собеседника и давать обратную связь.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 pt-4">
        <h4 className="text-sm font-semibold text-gray-500 mb-3">
          Быстрые действия
        </h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  // Navigate to Services tab or show modal
                  alert(`${action.label} - перейдите на вкладку Сервисы`);
                }}
                className="flex-shrink-0 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-blue-100 active:scale-95 transition-all"
              >
                <ActionIcon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onStart={() => handleStartScenario(scenario.id)}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Scenario Card Component
function ScenarioCard({
  scenario,
  onStart,
  isLoading,
}: {
  scenario: Scenario;
  onStart: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{scenario.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{scenario.title}</h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{scenario.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {getDifficultyStars(scenario.difficulty)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{scenario.estimatedMinutes} мин
            </span>
          </div>
        </div>
        <button
          onClick={onStart}
          disabled={isLoading}
          className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Начать'
          )}
        </button>
      </div>
    </div>
  );
}

// Chat Screen
function ChatScreen() {
  const {
    currentSession,
    scenarios,
    isSending,
    error,
    sendMessage,
    endSession,
    clearError,
  } = useTrainerStore();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentScenario = scenarios.find((s) => s.id === currentSession?.scenarioId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleEndSession = () => {
    endSession();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFeedbackIcon = (score: 'correct' | 'partial' | 'incorrect') => {
    switch (score) {
      case 'correct':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'incorrect':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getFeedbackColor = (score: 'correct' | 'partial' | 'incorrect') => {
    switch (score) {
      case 'correct':
        return 'bg-green-50 border-green-200';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200';
      case 'incorrect':
        return 'bg-red-50 border-red-200';
    }
  };

  // Show completion screen
  if (currentSession?.status === 'completed') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Сценарий завершён!</h2>
            {currentSession.finalScore !== undefined && (
              <div className="mb-4">
                <p className="text-gray-500 mb-1">Ваш результат:</p>
                <p className="text-4xl font-bold text-blue-600">
                  {currentSession.finalScore}
                  <span className="text-lg text-gray-400">/100</span>
                </p>
              </div>
            )}
            <p className="text-gray-500 mb-6">
              {currentScenario?.title}
            </p>
            <button
              onClick={handleEndSession}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all"
            >
              Выбрать другой сценарий
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center gap-3">
        <button
          onClick={handleEndSession}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{currentScenario?.title || 'Тренировка'}</h1>
          <p className="text-xs text-white/80 truncate">{currentScenario?.description}</p>
        </div>
        <button
          onClick={handleEndSession}
          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          Завершить
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-700 p-1"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 bg-gray-50">
        {/* Initial instruction */}
        {currentSession?.messages.length === 0 && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[85%] bg-white text-gray-900 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-200">
              <p className="text-sm leading-relaxed">
                Сценарий начался. Отвечайте так, как вы бы ответили в реальной ситуации.
              </p>
            </div>
          </div>
        )}

        {currentSession?.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            formatTime={formatTime}
            getFeedbackIcon={getFeedbackIcon}
            getFeedbackColor={getFeedbackColor}
          />
        ))}

        {/* Loading indicator */}
        {isSending && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[85%] bg-white text-gray-900 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-500">Анализирую ответ...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Введите ваш ответ..."
            disabled={isSending}
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              inputMessage.trim() && !isSending
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSending ? (
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

// Message Bubble Component
function MessageBubble({
  message,
  formatTime,
  getFeedbackIcon,
  getFeedbackColor,
}: {
  message: Message;
  formatTime: (timestamp: string) => string;
  getFeedbackIcon: (score: 'correct' | 'partial' | 'incorrect') => JSX.Element;
  getFeedbackColor: (score: 'correct' | 'partial' | 'incorrect') => string;
}) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>

      {/* Feedback badge for user messages */}
      {isUser && message.feedback && (
        <div className={`ml-2 self-end mb-1 px-2 py-1 rounded-lg border text-xs ${getFeedbackColor(message.feedback.score)}`}>
          <div className="flex items-center gap-1">
            {getFeedbackIcon(message.feedback.score)}
            <span className="font-medium">
              {message.feedback.score === 'correct' && 'Верно'}
              {message.feedback.score === 'partial' && 'Частично'}
              {message.feedback.score === 'incorrect' && 'Неверно'}
            </span>
          </div>
          {message.feedback.comment && (
            <p className="mt-1 text-gray-600">{message.feedback.comment}</p>
          )}
          {message.feedback.tip && (
            <p className="mt-1 text-blue-600 italic">{message.feedback.tip}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Main AssistantScreen Component
export function AssistantScreen() {
  const { currentSession } = useTrainerStore();

  if (currentSession) {
    return <ChatScreen />;
  }

  return <ScenarioSelectionScreen />;
}
