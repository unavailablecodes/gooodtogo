'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Dog, Star, Search } from 'lucide-react';

export default function SearchPetsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [query, setQuery] = useState('');
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user?.id)
      .single();
    setBusiness(data);
  };

  const searchPets = async (search: string) => {
    if (search.length < 2) { setPets([]); return; }
    setLoading(true);

    const { data } = await supabase
      .from('pets')
      .select('id, name, species, breed, public_id, overall_score, pet_photos(*), owner:profiles(full_name)')
      .or(`name.ilike.%${search}%,public_id.ilike.%${search}%`)
      .eq('is_active', true)
      .limit(20);

    setPets(data || []);
    setLoading(false);
  };

  const handleCheckIn = async (petId: string) => {
    if (!business) return;

    await supabase.from('business_visits').insert({
      pet_id: petId,
      business_id: business.id,
      check_in_time: new Date().toISOString(),
      visit_date: new Date().toISOString().split('T')[0],
    });

    router.push('/business');
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-black/5">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-[#86868b] hover:text-[#1d1d1f]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[16px] font-semibold text-[#1d1d1f]">Find Pet</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b]" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); searchPets(e.target.value); }}
            placeholder="Search by name or ID..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-black/5 rounded-2xl text-[15px] focus:outline-none focus:border-[#1d1d1f]"
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-2xl animate-pulse">🐾</span>
          </div>
        ) : pets.length === 0 && query.length >= 2 ? (
          <div className="text-center py-12">
            <Dog className="w-10 h-10 text-[#86868b] mx-auto mb-3" />
            <p className="text-[14px] text-[#86868b]">No pets found</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-10 h-10 text-[#86868b] mx-auto mb-3" />
            <p className="text-[14px] text-[#86868b]">Search for a pet by name or ID</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pets.map((pet) => {
              const photo = pet.pet_photos?.find((p: any) => p.is_primary) || pet.pet_photos?.[0];
              return (
                <div key={pet.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-black/5">
                  <div className="w-14 h-14 rounded-xl bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
                    {photo ? (
                      <img src={photo.url} className="w-full h-full object-cover" />
                    ) : (
                      <Dog className="w-7 h-7 text-[#86868b]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-[#1d1d1f] truncate">{pet.name}</span>
                      <span className="px-2 py-0.5 bg-[#f5f5f5] text-[11px] text-[#86868b] rounded-md">{pet.public_id}</span>
                    </div>
                    <p className="text-[13px] text-[#86868b]">{pet.breed || pet.species}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#ffd60a]" fill="#ffd60a" />
                      <span className="text-[14px] font-semibold text-[#1d1d1f]">
                        {pet.overall_score > 0 ? pet.overall_score.toFixed(0) : '--'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#86868b]">score</p>
                  </div>
                  <button
                    onClick={() => handleCheckIn(pet.id)}
                    className="px-4 py-2 bg-[#1d1d1f] text-white text-[13px] font-medium rounded-xl"
                  >
                    Check In
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
