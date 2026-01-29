'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Send, ArrowLeft, CheckCircle, AlertCircle, XCircle, Clock, Star, Trophy, Shield, Calculator, Hash, AlertTriangle, Scale, Phone, MessageCircle, X, User, Building, Search, ChevronDown, FileText, MapPin, Briefcase, Heart, Flag, Home, CreditCard, Bot, BookOpen } from 'lucide-react';
import { useTrainerStore, getDifficultyStars, type Scenario, type Message } from '@/lib/stores/trainerStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useToast } from '@/hooks/useToast';
import { KNOWLEDGE_BASE, KNOWLEDGE_COUNT, type KnowledgeItem } from '@/data';
import { AIChatPanel } from '@/components/assistant/AIChatPanel';

// Quick Actions for ScenarioSelectionScreen
const quickActions = [
  { id: 'check-docs', label: 'Проверить документы', labelEn: 'Check docs', icon: Shield },
  { id: 'calc-patent', label: 'Рассчитать патент', labelEn: 'Calc patent', icon: Calculator },
  { id: 'find-inn', label: 'Найти ИНН', labelEn: 'Find INN', icon: Hash },
];

// Lawyer Modal Component
function LawyerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to backend
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setName('');
      setPhone('');
      setMessage('');
      onClose();
    }, 2000);
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/79001234567?text=' + encodeURIComponent(t('assistant.lawyerModal.whatsappMessage')), '_blank');
  };

  const handleTelegram = () => {
    window.open('https://t.me/migranthub_lawyer', '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:+78002227447';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('assistant.lawyerModal.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Quick Contact Buttons */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">
              {t('assistant.lawyerModal.quickContact')}
            </h3>

            {/* Hotline */}
            <button
              onClick={handleCall}
              className="w-full flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">{t('assistant.lawyerModal.hotline')}</p>
                <p className="text-sm text-green-600">+7 (800) 222-74-47</p>
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {t('assistant.lawyerModal.free')}
              </span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">WhatsApp</p>
                <p className="text-sm text-emerald-600">{t('assistant.lawyerModal.writeNow')}</p>
              </div>
            </button>

            {/* Telegram */}
            <button
              onClick={handleTelegram}
              className="w-full flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Telegram</p>
                <p className="text-sm text-blue-600">@migranthub_lawyer</p>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase">{t('common.or')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Callback Form */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">
              {t('assistant.lawyerModal.callbackRequest')}
            </h3>

            {isSubmitted ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-green-800">{t('assistant.lawyerModal.requestSent')}</p>
                <p className="text-sm text-green-600 mt-1">{t('assistant.lawyerModal.willCallBack')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t('assistant.lawyerModal.yourName')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('assistant.lawyerModal.namePlaceholder')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t('assistant.lawyerModal.yourPhone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (___) ___-__-__"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t('assistant.lawyerModal.yourQuestion')}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('assistant.lawyerModal.questionPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                  {t('assistant.lawyerModal.requestCallback')}
                </button>
              </form>
            )}
          </div>

          {/* Partner Lawyers Info */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {t('assistant.lawyerModal.partnerLawyers')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('assistant.lawyerModal.partnerDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Legal Disclaimer Component
function LegalDisclaimer() {
  const { t } = useTranslation();
  const [isLawyerModalOpen, setIsLawyerModalOpen] = useState(false);

  return (
    <>
      <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-800 leading-relaxed">
              {t('assistant.disclaimer.text')}
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Hire Lawyer Button */}
      <div className="mx-4 mt-3">
        <button
          onClick={() => setIsLawyerModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] transition-all"
        >
          <Scale className="w-5 h-5" />
          {t('assistant.disclaimer.hireLawyer')}
        </button>
      </div>

      <LawyerModal
        isOpen={isLawyerModalOpen}
        onClose={() => setIsLawyerModalOpen(false)}
      />
    </>
  );
}


// Knowledge Base Section Component
function KnowledgeBaseSection() {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    { id: 'patent', label: t('knowledgeBase.categories.patent'), icon: FileText },
    { id: 'registration', label: t('knowledgeBase.categories.registration'), icon: MapPin },
    { id: 'rvp', label: t('knowledgeBase.categories.rvp'), icon: CreditCard },
    { id: 'vnj', label: t('knowledgeBase.categories.vnj'), icon: Home },
    { id: 'work', label: t('knowledgeBase.categories.work'), icon: Briefcase },
    { id: 'medical', label: t('knowledgeBase.categories.medical'), icon: Heart },
    { id: 'sos', label: t('knowledgeBase.categories.sos'), icon: AlertTriangle },
    { id: 'citizenship', label: t('knowledgeBase.categories.citizenship'), icon: Flag },
  ];

  // Filter FAQ items
  const filteredItems = KNOWLEDGE_BASE.filter((item: KnowledgeItem) => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const questionText = language === 'ru' ? item.question.ru : item.question.en;
    const answerText = language === 'ru' ? item.answer.ru : item.answer.en;
    const matchesSearch = !searchQuery ||
      questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      answerText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-500">
          {t('knowledgeBase.title')}
        </h4>
        <span className="text-xs text-gray-400">
          {t('knowledgeBase.questionsCount', { count: KNOWLEDGE_COUNT })}
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('knowledgeBase.searchPlaceholder')}
          className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('common.all')}
        </button>
        {categories.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CatIcon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* FAQ list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-400">
            {t('knowledgeBase.noResults')}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900 pr-4">
                  {language === 'ru' ? item.question.ru : item.question.en}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                    expandedId === item.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedId === item.id && (
                <div className="px-4 pb-3 pt-0">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {language === 'ru' ? item.answer.ru : item.answer.en}
                  </p>
                  {item.legalReference && (
                    <p className="mt-2 text-xs text-blue-600">
                      {item.legalReference}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
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

// Tab Switcher Component
function TabSwitcher({
  activeTab,
  onTabChange
}: {
  activeTab: 'chat' | 'knowledge';
  onTabChange: (tab: 'chat' | 'knowledge') => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex bg-gray-100 p-1 rounded-xl mx-4 mt-4">
      <button
        onClick={() => onTabChange('chat')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
          activeTab === 'chat'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Bot className="w-4 h-4" />
        {t('assistant.chat.tabTitle')}
      </button>
      <button
        onClick={() => onTabChange('knowledge')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
          activeTab === 'knowledge'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        {t('assistant.chat.knowledgeTab')}
      </button>
    </div>
  );
}

// Main AssistantScreen Component
export function AssistantScreen() {
  const { currentSession } = useTrainerStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const { t } = useTranslation();

  // If trainer session is active, show trainer chat
  if (currentSession) {
    return <ChatScreen />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t('assistant.title')}</h1>
            <p className="text-sm text-white/80">{t('assistant.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'chat' ? (
          <AIChatPanel />
        ) : (
          <div className="h-full overflow-y-auto">
            <LegalDisclaimer />
            <KnowledgeBaseSection />
            <ScenarioSelectionContent />
          </div>
        )}
      </div>
    </div>
  );
}

// Extracted content from ScenarioSelectionScreen for reuse
function ScenarioSelectionContent() {
  const { scenarios, isLoading, error, fetchScenarios, startScenario } = useTrainerStore();
  const { t } = useTranslation();
  const toast = useToast();

  useEffect(() => {
    if (scenarios.length === 0) {
      fetchScenarios();
    }
  }, [scenarios.length, fetchScenarios]);

  const handleStartScenario = async (scenarioId: string) => {
    await startScenario(scenarioId);
  };

  return (
    <>
      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 pt-4">
        <h4 className="text-sm font-semibold text-gray-500 mb-3">
          {t('assistant.chat.quickActions')}
        </h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  toast.info(`${action.label} - ${t('common.goToServicesTab')}`);
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

      {/* Trainer Scenarios */}
      <div className="px-4 pt-4 pb-20">
        <h4 className="text-sm font-semibold text-gray-500 mb-3">
          {t('assistant.chat.trainerScenarios')}
        </h4>
        {isLoading && scenarios.length === 0 ? (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : (
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
        )}
      </div>
    </>
  );
}
