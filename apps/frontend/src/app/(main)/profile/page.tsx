'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ProfileForm } from '@/features/profile/components';
import { useProfileStore } from '@/lib/stores';
import { useTranslation } from '@/lib/i18n';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { profile, updateProfile, setProfile } = useProfileStore();
  const { t } = useTranslation();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      // If no profile exists, create one
      if (!profile) {
        const newProfile = {
          id: crypto.randomUUID(),
          userId: crypto.randomUUID(), // Would come from auth
          ...data,
          language: 'ru',
          onboardingCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProfile(newProfile);
      } else {
        updateProfile(data);
      }

      // Navigate back
      router.push('/prototype');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{t('profile.title')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
        <ProfileForm
          initialData={profile || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
