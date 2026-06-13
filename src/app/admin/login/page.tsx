'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); return; }

      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          await supabase.auth.signOut();
          setError('Access denied. Admin privileges required.');
        }
      }
    } catch { setError('An error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <div className="w-full max-w-[320px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1d1d1f] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-[#1d1d1f]">Admin</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-black/5 space-y-4">
          {error && (
            <div className="p-3 bg-[#ff3b30]/5 text-[#ff3b30] text-[13px] rounded-lg">{error}</div>
          )}

          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" required
            className="w-full px-4 py-3 text-[14px] bg-[#fafafa] border border-black/5 rounded-lg focus:outline-none focus:border-[#1d1d1f]"
          />

          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" required
            className="w-full px-4 py-3 text-[14px] bg-[#fafafa] border border-black/5 rounded-lg focus:outline-none focus:border-[#1d1d1f]"
          />

          <button
            type="submit" disabled={loading}
            className="w-full py-3 text-[14px] font-medium bg-[#1d1d1f] text-white rounded-lg hover:bg-black disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/" className="text-[13px] text-[#86868b] hover:text-[#1d1d1f]">← Back to app</a>
        </div>
      </div>
    </div>
  );
}
