'use client';

import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/lib/stores';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';
import { getCountryByIso, type SupportedLanguage } from '@/data';

export function PersonalHeader() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { language } = useTranslation();

  const countryName = profile?.citizenship
    ? getCountryByIso(profile.citizenship)?.name[language as SupportedLanguage] ||
      getCountryByIso(profile.citizenship)?.name.ru ||
      profile.citizenship
    : '';

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">MigrantHub</span>
          {countryName && (
            <span className="text-sm text-muted-foreground">
              {countryName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/profile')}
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default PersonalHeader;
