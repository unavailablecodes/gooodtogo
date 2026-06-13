'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';

const businessTypes = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'airline', label: 'Airline' },
  { value: 'housing_society', label: 'Housing Society' },
  { value: 'pet_store', label: 'Pet Store' },
  { value: 'vet', label: 'Veterinary Clinic' },
  { value: 'other', label: 'Other' },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBusiness = searchParams.get('type') === 'business';
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (isBusiness && !businessName) {
      setError('Business name is required');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            is_business: isBusiness,
            business_name: isBusiness ? businessName : null,
            business_type: isBusiness ? businessType : null,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        const role = isBusiness ? 'business' : 'user';
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role,
        });

        if (isBusiness) {
          await supabase.from('businesses').insert({
            owner_id: data.user.id,
            business_name: businessName,
            business_type: businessType || 'other',
          });
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-16 h-16 bg-[#34c759]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#34c759]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Check your email</h2>
        <p className="text-[15px] text-[#86868b] mt-3 max-w-[280px] mx-auto">
          We've sent a verification link to <span className="text-[#1d1d1f] font-medium">{email}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-[#ff3b30]/10 text-[#ff3b30] text-[14px] rounded-2xl">
          {error}
        </div>
      )}

      {isBusiness && (
        <>
          <Input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
          <Select
            options={businessTypes}
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="Business Type"
          />
        </>
      )}

      <Input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

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

      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <Button type="submit" className="w-full" size="lg" isLoading={loading}>
        {isBusiness ? 'Create Business Account' : 'Create Account'}
      </Button>

      <p className="text-center text-[14px] text-[#86868b]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#0071e3] font-medium hover:underline">
          Sign in
        </Link>
      </p>

      <div className="pt-4 border-t border-black/5">
        <p className="text-center text-[13px] text-[#86868b]">
          {isBusiness ? (
            <>
              Register as pet parent?{' '}
              <Link href="/register" className="text-[#0071e3] hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Register as business?{' '}
              <Link href="/register?type=business" className="text-[#0071e3] hover:underline">
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 pb-12 px-6">
      <div className="max-w-[400px] mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#1d1d1f] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">Create account</h1>
          <p className="text-[15px] text-[#86868b] mt-2">Get started for free</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
