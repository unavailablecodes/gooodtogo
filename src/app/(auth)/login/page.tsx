'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(redirect);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-[#ff3b30]/10 text-[#ff3b30] text-[14px] rounded-2xl">
          {error}
        </div>
      )}

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="flex items-center justify-end">
        <Link href="/forgot-password" className="text-[13px] text-[#0071e3] hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={loading}>
        Continue
      </Button>

      <p className="text-center text-[14px] text-[#86868b]">
        Don't have an account?{' '}
        <Link href="/register" className="text-[#0071e3] font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 pb-12 px-6">
      <div className="max-w-[400px] mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#1d1d1f] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">Welcome back</h1>
          <p className="text-[15px] text-[#86868b] mt-2">Sign in to continue</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
