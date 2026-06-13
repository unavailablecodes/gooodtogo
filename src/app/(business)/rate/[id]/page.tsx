'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Dog, Star } from 'lucide-react';

export default function RatePetPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const supabase = createClient();
  const visitId = params.id as string;

  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [ratings, setRatings] = useState({
    overall: 3,
    was_friendly: true,
    was_noisy: false,
    was_aggressive: false,
    cleaned_up: true,
    would_allow_again: true,
    notes: '',
  });

  useEffect(() => {
    if (visitId) fetchVisit();
  }, [visitId]);

  const fetchVisit = async () => {
    const { data } = await supabase
      .from('business_visits')
      .select(`
        *,
        pet:pets(id, name, species, breed, public_id, pet_photos(*))
      `)
      .eq('id', visitId)
      .single();
    setVisit(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Calculate overall score (convert to 1-5 scale from 0-100)
    const score = ((ratings.overall / 100) * 4 + 1).toFixed(1);

    // Insert checkin
    await supabase.from('business_checkins').insert({
      pet_id: visit.pet_id,
      business_id: visit.business_id,
      overall_rating: parseFloat(score),
      was_friendly: ratings.was_friendly,
      was_noisy: ratings.was_noisy,
      was_aggressive: ratings.was_aggressive,
      cleaned_up_after: ratings.cleaned_up,
      would_allow_again: ratings.would_allow_again,
      notes: ratings.notes,
      verified: true,
      visit_date: new Date().toISOString().split('T')[0],
    });

    // Update visit
    await supabase.from('business_visits').update({
      check_out_time: new Date().toISOString(),
      pet_rated: true,
    }).eq('id', visitId);

    router.push('/business');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <span className="text-2xl animate-pulse">🐾</span>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#86868b]">Visit not found</p>
      </div>
    );
  }

  const photo = visit.pet?.pet_photos?.find((p: any) => p.is_primary) || visit.pet?.pet_photos?.[0];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-black/5">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-[#86868b] hover:text-[#1d1d1f]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[16px] font-semibold text-[#1d1d1f]">Rate Pet</h1>
          <div className="w-6" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-6 py-8 space-y-6">
        {/* Pet Info */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-black/5">
          <div className="w-16 h-16 rounded-2xl bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
            {photo ? (
              <img src={photo.url} className="w-full h-full object-cover" />
            ) : (
              <Dog className="w-8 h-8 text-[#86868b]" />
            )}
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#1d1d1f]">{visit.pet?.name}</h2>
            <p className="text-[14px] text-[#86868b]">{visit.pet?.breed || visit.pet?.species}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-[#ffd60a]" fill="#ffd60a" />
              <span className="text-[14px] font-medium text-[#1d1d1f]">
                {visit.pet?.overall_score > 0 ? visit.pet.overall_score.toFixed(0) : '--'}/100
              </span>
              <span className="text-[12px] text-[#86868b]">score</span>
            </div>
          </div>
        </div>

        {/* Quick Ratings */}
        <div className="p-6 bg-white rounded-2xl border border-black/5 space-y-5">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Quick Ratings</h3>

          {/* Overall Rating */}
          <div>
            <label className="text-[13px] text-[#86868b] block mb-3">Overall Experience</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRatings(r => ({ ...r, overall: n * 20 }))}
                  className={`flex-1 py-3 rounded-xl text-[14px] font-medium transition-colors ${
                    ratings.overall >= n * 20
                      ? 'bg-[#1d1d1f] text-white'
                      : 'bg-[#f5f5f5] text-[#86868b]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          {[
            { key: 'was_friendly', label: 'Was Friendly', yes: true },
            { key: 'was_noisy', label: 'Was Noisy', yes: false },
            { key: 'was_aggressive', label: 'Was Aggressive', yes: false },
            { key: 'cleaned_up', label: 'Cleaned Up After', yes: true },
            { key: 'would_allow_again', label: 'Would Allow Again', yes: true },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-[14px] text-[#1d1d1f]">{item.label}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRatings(r => ({ ...r, [item.key]: item.yes }))}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    ratings[item.key as keyof typeof ratings] === item.yes
                      ? 'bg-[#34c759] text-white'
                      : 'bg-[#f5f5f5] text-[#86868b]'
                  }`}
                >
                  {item.yes ? 'Yes' : 'No'}
                </button>
                <button
                  type="button"
                  onClick={() => setRatings(r => ({ ...r, [item.key]: !item.yes }))}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    ratings[item.key as keyof typeof ratings] !== item.yes
                      ? 'bg-[#ff3b30] text-white'
                      : 'bg-[#f5f5f5] text-[#86868b]'
                  }`}
                >
                  {item.yes ? 'No' : 'Yes'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="p-6 bg-white rounded-2xl border border-black/5">
          <label className="text-[13px] text-[#86868b] block mb-3">Notes (optional)</label>
          <textarea
            value={ratings.notes}
            onChange={(e) => setRatings(r => ({ ...r, notes: e.target.value }))}
            placeholder="Any observations..."
            rows={3}
            className="w-full px-4 py-3 bg-[#f5f5f5] rounded-xl text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/20"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-[#1d1d1f] text-white text-[15px] font-semibold rounded-2xl hover:bg-black disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit & Checkout'}
        </button>
      </form>
    </div>
  );
}
