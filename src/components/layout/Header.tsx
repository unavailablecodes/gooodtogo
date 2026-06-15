'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, User, ChevronDown } from 'lucide-react';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/pets', label: 'My Pets' },
    ...(profile?.role === 'business' || profile?.role === 'admin' ? [{ href: '/business', label: 'Business' }] : []),
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg">🐾</span>
          <span className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight">Pet Profile Score</span>
        </Link>

        {/* Desktop Navigation */}
        {user ? (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-[#1d1d1f] text-white'
                    : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Name + Avatar Button */}
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 transition-all"
              >
                <span className="text-[13px] text-[#1d1d1f] font-medium">
                  {profile?.full_name || 'User'}
                </span>
                <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
                <ChevronDown className={`w-4 h-4 text-[#86868b] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-black/5 shadow-lg py-2 animate-fade-in">
                  <div className="px-4 py-2 border-b border-black/5">
                    <p className="text-[13px] font-medium text-[#1d1d1f]">{profile?.full_name || 'User'}</p>
                    <p className="text-[12px] text-[#86868b]">{profile?.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1d1d1f] hover:bg-black/5 transition-all"
                  >
                    <Settings className="w-4 h-4 text-[#86868b]" />
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-[#ff3b30] hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[13px]">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-[13px]">Get Started</Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#1d1d1f] hover:bg-black/5 rounded-full transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              {mobileMenuOpen ? (
                <path d="M14.25 3.75L3.75 14.25M3.75 3.75L14.25 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              ) : (
                <path d="M2.25 4.5h13.5M2.25 9h13.5M2.25 13.5h13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-black/5 shadow-lg">
          <nav className="px-6 py-4 space-y-1">
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/pets', label: 'My Pets' },
              { href: '/settings', label: 'Settings' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 text-[15px] font-medium rounded-xl transition-all
                  ${isActive(item.href)
                    ? 'bg-[#f5f5f7] text-[#1d1d1f]'
                    : 'text-[#86868b] hover:bg-[#f5f5f7]'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
