'use client';

import { useRouter } from 'next/navigation';
import { ProfilingScreen } from '@/components/onboarding/ProfilingScreen';

export default function OnboardingPage() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/dashboard');
  };

  return <ProfilingScreen onNext={handleNext} />;
}
