'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Building2, CheckCircle, Clock, Star, Dog, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function BusinessDashboard() {
  const { user, profile, isBusiness, isAdmin } = useAuth();
  const supabase = createClient();

  const [business, setBusiness] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    // Get business info
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user?.id)
      .single();
    setBusiness(businessData);

    if (businessData) {
      // Get recent visits
      const { data: visitsData } = await supabase
        .from('business_visits')
        .select(`
          *,
          pet:pets(id, name, species, breed, public_id, overall_score, pet_photos(*)
        `)
        .eq('business_id', businessData.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setVisits(visitsData || []);
    }

    setLoading(false);
  };

  const handleCheckOut = async (visitId: string) => {
    await supabase.from('business_visits').update({ check_out_time: new Date().toISOString() }).eq('id', visitId);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-2xl animate-pulse">🐾</span>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <Building2 className="w-12 h-12 text-[#86868b] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1d1d1f]">No Business Profile</h2>
        <p className="text-[#86868b] mt-2">Contact admin to create your business profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1d1d1f] rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#1d1d1f]">{business.business_name}</h1>
            <p className="text-[13px] text-[#86868b]">{business.business_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#ffd60a]" fill="#ffd60a" />
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {business.pet_friendly_score > 0 ? business.pet_friendly_score.toFixed(1) : '--'}
              </span>
            </div>
            <p className="text-[11px] text-[#86868b]">Pet-Friendly Score</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/business/scan" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 hover:border-[#1d1d1f] transition-colors">
          <div className="w-10 h-10 bg-[#1d1d1f] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h1m-15-9h1m0-4v4m0 4v.01M12 20v-4m-4-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-[14px] font-medium text-[#1d1d1f]">Scan QR</span>
            <p className="text-[11px] text-[#86868b]">Check-in a pet</p>
          </div>
        </Link>

        <Link href="/business/search" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 hover:border-[#1d1d1f] transition-colors">
          <div className="w-10 h-10 bg-[#0071e3] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-[14px] font-medium text-[#1d1d1f]">Find Pet</span>
            <p className="text-[11px] text-[#86868b]">Search & check-in</p>
          </div>
        </Link>
      </div>

      {/* Current Visits */}
      <div className="mb-8">
        <h2 className="text-[16px] font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Currently Here
        </h2>

        {visits.filter(v => !v.check_out_time).length === 0 ? (
          <div className="p-6 bg-white rounded-xl border border-black/5 text-center">
            <p className="text-[14px] text-[#86868b]">No pets currently checked in</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visits.filter(v => !v.check_out_time).map((visit) => {
              const photo = visit.pet?.pet_photos?.find((p: any) => p.is_primary) || visit.pet?.pet_photos?.[0];
              return (
                <div key={visit.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-black/5">
                  <div className="w-12 h-12 rounded-xl bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
                    {photo ? (
                      <img src={photo.url} className="w-full h-full object-cover" />
                    ) : (
                      <Dog className="w-6 h-6 text-[#86868b]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-[14px] font-medium text-[#1d1d1f]">{visit.pet?.name}</span>
                    <p className="text-[12px] text-[#86868b]">{visit.pet?.breed || visit.pet?.species}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-[#86868b]">Score: {visit.pet?.overall_score > 0 ? visit.pet.overall_score.toFixed(0) : '--'}</p>
                    <p className="text-[11px] text-[#86868b]">Checked in {new Date(visit.check_in_time).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/business/rate/${visit.id}`}
                      className="px-3 py-1.5 bg-[#1d1d1f] text-white text-[12px] font-medium rounded-lg"
                    >
                      Rate & Checkout
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-[16px] font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Recent Check-outs
        </h2>

        {visits.filter(v => v.check_out_time).length === 0 ? (
          <div className="p-6 bg-white rounded-xl border border-black/5 text-center">
            <p className="text-[14px] text-[#86868b]">No recent visits</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visits.filter(v => v.check_out_time).slice(0, 5).map((visit) => {
              const photo = visit.pet?.pet_photos?.find((p: any) => p.is_primary) || visit.pet?.pet_photos?.[0];
              return (
                <div key={visit.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-black/5">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
                    {photo ? (
                      <img src={photo.url} className="w-full h-full object-cover" />
                    ) : (
                      <Dog className="w-5 h-5 text-[#86868b]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-[14px] font-medium text-[#1d1d1f]">{visit.pet?.name}</span>
                    <p className="text-[12px] text-[#86868b]">
                      {visit.pet_rated ? '✓ Rated' : 'Pending rating'} • {visit.business_rated ? '✓ Your rating given' : 'Rate pending'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-[#86868b]">
                      {new Date(visit.visit_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
