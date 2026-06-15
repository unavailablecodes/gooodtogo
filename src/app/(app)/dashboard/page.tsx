'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { PetCard } from '@/components/pet/PetCard';
import { Avatar } from '@/components/ui/Avatar';
import { ScoreDisplay } from '@/components/ui/ScoreDisplay';
import { Plus, PawPrint, Star, Building2, QrCode, ArrowRight, Users, Store, TrendingUp, ExternalLink } from 'lucide-react';
import type { Pet, NeighborVerification, BusinessCheckin, Review } from '@/types/database';

interface PetStats {
  verifications: number;
  checkins: number;
  reviews: number;
}

export default function DashboardPage() {
  const { user, profile, isBusiness } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [petStats, setPetStats] = useState<Record<string, PetStats>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      const { data } = await supabase
        .from('pets')
        .select(`
          *,
          pet_photos(*)
        `)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setPets(data || []);

      // Fetch stats for each pet
      if (data && data.length > 0) {
        const stats: Record<string, PetStats> = {};
        for (const pet of data) {
          const [verificationsRes, checkinsRes, reviewsRes] = await Promise.all([
            supabase.from('neighbor_verifications').select('id', { count: 'exact' }).eq('pet_id', pet.id),
            supabase.from('business_checkins').select('id', { count: 'exact' }).eq('pet_id', pet.id),
            supabase.from('reviews').select('id', { count: 'exact' }).eq('pet_id', pet.id).eq('is_approved', true),
          ]);
          stats[pet.id] = {
            verifications: verificationsRes.count || 0,
            checkins: checkinsRes.count || 0,
            reviews: reviewsRes.count || 0,
          };
        }
        setPetStats(stats);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.full_name || 'there'}!
            </h1>
            <p className="text-gray-600">
              Manage your pet profiles and track their social scores.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/pets/new">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Add New Pet</CardTitle>
                <CardDescription>Create a profile for your pet</CardDescription>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/pets">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">My Pets</CardTitle>
                <CardDescription>{pets.length} pet{pets.length !== 1 ? 's' : ''}</CardDescription>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/reviews">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-base">My Reviews</CardTitle>
                <CardDescription>View reviews you've written</CardDescription>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/scan">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <QrCode className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Scan QR</CardTitle>
                <CardDescription>Scan a pet's QR code</CardDescription>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* My Pets Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Pets</h2>
          <Link href="/pets/new">
            <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Pet
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : pets.length > 0 ? (
          <div className="space-y-6">
            {pets.map((pet) => {
              const stats = petStats[pet.id] || { verifications: 0, checkins: 0, reviews: 0 };
              return (
                <Link key={pet.id} href={`/pets/${pet.id}`}>
                  <Card hover className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Pet Photo */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {pet.pet_photos && pet.pet_photos[0] ? (
                          <img src={pet.pet_photos[0].url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                        )}
                      </div>

                      {/* Pet Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                            <p className="text-sm text-gray-500">{pet.breed || pet.species}</p>
                          </div>
                          <ScoreDisplay score={pet.overall_score} size="sm" />
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 mt-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            <span>{stats.verifications} neighbor{stats.verifications !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Store className="w-3 h-3" />
                            <span>{stats.checkins} check-in{stats.checkins !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Star className="w-3 h-3" />
                            <span>{stats.reviews} review{stats.reviews !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {/* View Profile Link */}
                        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                          <ExternalLink className="w-4 h-4" />
                          <span>View public profile</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first pet profile to start building their social score.
            </p>
            <Link href="/pets/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Add Your First Pet
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Business Section (if business user) */}
      {isBusiness && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Business Tools</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/business">
              <Card hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Business Dashboard</CardTitle>
                      <CardDescription>Manage your business account</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </Link>
            <Link href="/scan">
              <Card hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Scan Pet QR</CardTitle>
                      <CardDescription>Verify pets visiting your business</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </Link>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Tips to Boost Your Pet's Score</h2>
        </div>
        <Card>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <QrCode className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Share your QR code widely</h4>
                <p className="text-sm text-gray-600">The more people who can scan, the more verifications you'll receive.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Ask neighbors to verify</h4>
                <p className="text-sm text-gray-600">Neighbors can quickly confirm your pet's good behavior in just 30 seconds.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Encourage detailed reviews</h4>
                <p className="text-sm text-gray-600">Full reviews carry more weight than quick verifications.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
