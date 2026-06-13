'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (profile?.role !== 'business' && profile?.role !== 'admin') { router.push('/dashboard'); }
  }, [user, profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <span className="text-2xl animate-pulse">🐾</span>
      </div>
    );
  }

  if (!user || (profile?.role !== 'business' && profile?.role !== 'admin')) {
    return null;
  }

  return <div className="min-h-screen bg-[#fafafa]">{children}</div>;
}
