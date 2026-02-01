'use client';

import { useMemo } from 'react';
import { useProfileStore } from '@/lib/stores';
import type { Deadline, DeadlineType } from '@/components/personal/DeadlinesSection';

/**
 * Hook to calculate deadlines based on user profile and documents
 */
export function useDeadlines(): Deadline[] {
  const profile = useProfileStore((state) => state.profile);
  const documents = useProfileStore((state) => state.documents);

  const deadlines = useMemo(() => {
    const result: Deadline[] = [];
    const now = Date.now();

    // Calculate deadlines based on entry date
    if (profile?.entryDate) {
      const entryDate = new Date(profile.entryDate);

      // Registration deadline (7 days after entry for most countries)
      const registrationDeadline = new Date(entryDate);
      registrationDeadline.setDate(registrationDeadline.getDate() + 7);
      if (registrationDeadline.getTime() > now) {
        const daysUntil = Math.ceil((registrationDeadline.getTime() - now) / (1000 * 60 * 60 * 24));
        result.push({
          id: 'registration_deadline',
          title: 'Регистрация по месту пребывания',
          date: registrationDeadline,
          type: 'registration',
          urgent: daysUntil <= 3,
        });
      }

      // 90-day rule deadline
      const ninetyDayDeadline = new Date(entryDate);
      ninetyDayDeadline.setDate(ninetyDayDeadline.getDate() + 90);
      if (ninetyDayDeadline.getTime() > now) {
        const daysUntil = Math.ceil((ninetyDayDeadline.getTime() - now) / (1000 * 60 * 60 * 24));
        result.push({
          id: '90_day_rule',
          title: 'Срок пребывания (90 дней)',
          date: ninetyDayDeadline,
          type: 'visa',
          urgent: daysUntil <= 14,
        });
      }

      // Patent deadline (30 days after entry to apply)
      if (profile.purpose === 'work' && !profile.hasPatent) {
        const patentApplicationDeadline = new Date(entryDate);
        patentApplicationDeadline.setDate(patentApplicationDeadline.getDate() + 30);
        if (patentApplicationDeadline.getTime() > now) {
          const daysUntil = Math.ceil((patentApplicationDeadline.getTime() - now) / (1000 * 60 * 60 * 24));
          result.push({
            id: 'patent_application',
            title: 'Подача заявления на патент',
            date: patentApplicationDeadline,
            type: 'patent',
            urgent: daysUntil <= 7,
          });
        }
      }
    }

    // Patent expiry from profile
    if (profile?.patentExpiry) {
      const patentExpiry = new Date(profile.patentExpiry);
      if (patentExpiry.getTime() > now) {
        const daysUntil = Math.ceil((patentExpiry.getTime() - now) / (1000 * 60 * 60 * 24));
        result.push({
          id: 'patent_expiry',
          title: 'Срок действия патента',
          date: patentExpiry,
          type: 'patent',
          urgent: daysUntil <= 14,
        });
      }
    }

    // Registration expiry from profile
    if (profile?.registrationExpiry) {
      const registrationExpiry = new Date(profile.registrationExpiry);
      if (registrationExpiry.getTime() > now) {
        const daysUntil = Math.ceil((registrationExpiry.getTime() - now) / (1000 * 60 * 60 * 24));
        result.push({
          id: 'registration_expiry',
          title: 'Срок действия регистрации',
          date: registrationExpiry,
          type: 'registration',
          urgent: daysUntil <= 7,
        });
      }
    }

    // Deadlines from documents (expiry dates)
    documents.forEach((doc) => {
      if (doc.expiryDate) {
        const expiryDate = new Date(doc.expiryDate);
        if (expiryDate.getTime() > now) {
          const daysUntil = Math.ceil((expiryDate.getTime() - now) / (1000 * 60 * 60 * 24));

          // Map document type to deadline type
          const typeMap: Record<string, DeadlineType> = {
            passport: 'other',
            migration_card: 'visa',
            registration: 'registration',
            patent: 'patent',
            medical: 'medical',
            exam: 'exam',
            inn: 'other',
            other: 'other',
          };

          result.push({
            id: `doc_${doc.id}`,
            title: `${doc.title} - истекает`,
            date: expiryDate,
            type: typeMap[doc.type] || 'other',
            urgent: daysUntil <= 14,
          });
        }
      }
    });

    // Sort by date (closest first)
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [profile, documents]);

  return deadlines;
}

export default useDeadlines;
