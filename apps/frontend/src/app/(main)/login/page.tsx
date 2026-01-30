'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { useTranslation } from '@/lib/i18n';
import { QuickRegistrationSheet } from '@/components/registration';
import { Button } from '@/components/ui';
import { UserPlus, Shield, Bell, History } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAnonymous } = useAuthStore();
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    // If already registered, redirect to home
    if (!isAnonymous) {
      router.replace('/');
    }
  }, [isAnonymous, router]);

  // Don't render if not anonymous (will redirect)
  if (!isAnonymous) {
    return null;
  }

  const benefits = [
    {
      icon: Shield,
      title: t('login.benefits.save_results'),
      description: t('login.benefits.save_results_desc'),
    },
    {
      icon: Bell,
      title: t('login.benefits.reminders'),
      description: t('login.benefits.reminders_desc'),
    },
    {
      icon: History,
      title: t('login.benefits.history'),
      description: t('login.benefits.history_desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-6 safe-area-top text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{t('login.title')}</h1>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          {t('login.subtitle')}
        </p>
      </div>

      {/* Benefits */}
      <div className="p-4 space-y-3">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-white rounded-xl border"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div className="p-4">
        <Button
          onClick={() => setShowRegistration(true)}
          className="w-full"
          size="lg"
        >
          {t('login.create_profile')}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          {t('login.privacy_note')}
        </p>
      </div>

      {/* Registration Sheet */}
      <QuickRegistrationSheet
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onComplete={() => router.replace('/')}
        trigger="general"
      />
    </div>
  );
}
