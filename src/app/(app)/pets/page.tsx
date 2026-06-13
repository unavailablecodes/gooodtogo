'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Search, Trash2, Clock, Check, X } from 'lucide-react';
import type { Pet } from '@/types/database';

export default function PetsPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPets = async () => {
      if (!user) return;

      setLoading(true);
      const { data } = await supabase
        .from('pets')
        .select('*, pet_photos(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      setPets(data || []);
      setLoading(false);
    };

    fetchPets();
  }, [user]);

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.public_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteRequest = async (petId: string) => {
    await supabase
      .from('pets')
      .update({
        delete_requested: true,
        delete_requested_at: new Date().toISOString()
      })
      .eq('id', petId);

    setPets(prev => prev.map(p =>
      p.id === petId ? { ...p, delete_requested: true, delete_requested_at: new Date().toISOString() } : p
    ));
    setDeleteConfirmId(null);
  };

  const handleCancelDeleteRequest = async (petId: string) => {
    await supabase
      .from('pets')
      .update({
        delete_requested: false,
        delete_requested_at: null
      })
      .eq('id', petId);

    setPets(prev => prev.map(p =>
      p.id === petId ? { ...p, delete_requested: false, delete_requested_at: null } : p
    ));
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-black/5">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">My Pets</h1>
              <p className="text-[#86868b] mt-1">Manage your pet profiles</p>
            </div>
            <Link href="/pets/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Add Pet
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pets..."
              className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border-2 border-black/5 rounded-2xl focus:outline-none focus:border-[#1d1d1f] transition-colors placeholder:text-[#86868b]"
            />
          </div>
        </div>
      </div>

      {/* Pet List */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <span className="text-4xl animate-pulse">🐾</span>
              <p className="text-[#86868b] mt-4">Loading...</p>
            </div>
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl">🐾</span>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mt-4">
              {searchQuery ? 'No pets found' : 'No pets yet'}
            </h2>
            <p className="text-[#86868b] mt-2">
              {searchQuery ? 'Try a different search' : 'Create your first pet profile'}
            </p>
            {!searchQuery && (
              <Link href="/pets/new" className="inline-block mt-6">
                <Button>Add Your First Pet</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPets.map((pet) => {
              const primaryPhoto = pet.pet_photos?.find(p => p.is_primary) || pet.pet_photos?.[0];
              const isDeleteRequested = pet.delete_requested;

              return (
                <Card key={pet.id} padding="none" className="overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    {/* Photo */}
                    <Link href={`/pets/${pet.id}`} className="flex-shrink-0">
                      <div className={`w-20 h-20 rounded-2xl overflow-hidden ${pet.has_kci_certificate ? 'ring-2 ring-[#d4af37]' : ''}`}>
                        {primaryPhoto ? (
                          <img src={primaryPhoto.url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#f5f5f7] flex items-center justify-center text-3xl">
                            🐾
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <Link href={`/pets/${pet.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[17px] font-semibold text-[#1d1d1f] truncate">{pet.name}</h3>
                        {pet.has_kci_certificate && (
                          <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-[11px] font-medium rounded-full">Certified</span>
                        )}
                      </div>
                      <p className="text-[14px] text-[#86868b] truncate">
                        {pet.breed || pet.species} {pet.age_months ? `• ${Math.floor(pet.age_months / 12)} yrs` : ''}
                      </p>
                      {pet.overall_score > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[14px] font-medium text-[#1d1d1f]">{pet.overall_score.toFixed(0)}</span>
                          <span className="text-[12px] text-[#86868b]">/ 100</span>
                          <span className="text-[12px] text-[#86868b]">• {pet.total_reviews} reviews</span>
                        </div>
                      )}
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isDeleteRequested ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-[#ff9500]/10 text-[#ff9500] text-[12px] font-medium rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                          <button
                            onClick={() => handleCancelDeleteRequest(pet.id)}
                            className="px-3 py-1.5 text-[12px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : deleteConfirmId === pet.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-[#86868b]">Delete?</span>
                          <button
                            onClick={() => handleDeleteRequest(pet.id)}
                            className="px-3 py-1.5 bg-[#ff3b30] text-white text-[12px] font-medium rounded-full hover:bg-[#e8352c] transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1.5 text-[12px] font-medium text-[#86868b] hover:text-[#1d1d1f]"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(pet.id)}
                          className="p-2 text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/5 rounded-full transition-colors"
                          title="Request deletion"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete Request Banner */}
                  {isDeleteRequested && (
                    <div className="px-4 py-3 bg-[#ff9500]/5 border-t border-[#ff9500]/10">
                      <div className="flex items-center gap-2 text-[13px] text-[#ff9500]">
                        <Clock className="w-4 h-4" />
                        <span>Delete request submitted. Waiting for admin approval.</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
