'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Allow login page to show
    if (pathname === '/admin/login') return;

    // Redirect to login if not logged in
    if (!user) {
      router.push('/admin/login');
    } else if (profile?.role !== 'admin') {
      router.push('/');
    }
  }, [user, profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <span className="text-2xl animate-pulse">🐾</span>
      </div>
    );
  }

  // Allow login page to render
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#fafafa]">{children}</div>;
  }

  // Show loading while checking auth
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <span className="text-2xl animate-pulse">🐾</span>
      </div>
    );
  }

  return <div className="min-h-screen bg-[#fafafa]">{children}</div>;
}