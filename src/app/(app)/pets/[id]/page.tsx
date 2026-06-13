'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QRCode } from '@/components/ui/QRCode';
import { ElegantScoreCard } from '@/components/ui/ScoreDisplay';
import { ReviewCard } from '@/components/review/ReviewCard';
import { calculateMultiSourceScore, reviewsToScoringFormat } from '@/lib/utils/scoring';
import { formatAge, getSpeciesEmoji } from '@/lib/utils/format';
import { SPECIES_OPTIONS, SIZE_OPTIONS, GENDER_OPTIONS, VACCINATION_OPTIONS, DOG_BREEDS, CAT_BREEDS } from '@/lib/constants/categories';
import type { Pet, PetPhoto, Review, BusinessCheckin, NeighborVerification, BehavioralAssessment } from '@/types/database';

export default function PetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const petId = params.id as string;
  const supabase = createClient();

  const [pet, setPet] = useState<Pet | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [checkins, setCheckins] = useState<BusinessCheckin[]>([]);
  const [verifications, setVerifications] = useState<NeighborVerification[]>([]);
  const [assessments, setAssessments] = useState<BehavioralAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  const isOwner = user && pet?.owner_id === user.id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: petData } = await supabase
        .from('pets')
        .select('*, owner:profiles!pets_owner_id_fkey(*), pet_photos(*)')
        .eq('id', petId)
        .single();

      if (petData) {
        setPet(petData);

        const [reviewsRes, checkinsRes, verificationsRes, assessmentsRes] = await Promise.all([
          supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)').eq('pet_id', petId).eq('is_approved', true).order('created_at', { ascending: false }),
          supabase.from('business_checkins').select('*').eq('pet_id', petId).order('created_at', { ascending: false }),
          supabase.from('neighbor_verifications').select('*').eq('pet_id', petId).order('created_at', { ascending: false }),
          supabase.from('behavioral_assessments').select('*').eq('pet_id', petId).order('created_at', { ascending: false }),
        ]);

        setReviews(reviewsRes.data || []);
        setCheckins(checkinsRes.data || []);
        setVerifications(verificationsRes.data || []);
        setAssessments(assessmentsRes.data || []);
      }
      setLoading(false);
    };
    if (petId) fetchData();
  }, [petId]);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!pet || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${pet.id}/${Date.now()}.${fileExt}`;

    await supabase.storage.from('pet-photos').upload(fileName, file);
    const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(fileName);
    await supabase.from('pet_photos').insert({
      pet_id: pet.id, storage_path: fileName, url: publicUrl,
      is_primary: (pet.pet_photos?.length || 0) === 0,
      order_index: pet.pet_photos?.length || 0,
    });

    setPet(prev => prev ? { ...prev, pet_photos: [...(prev.pet_photos || []), { id: Date.now().toString(), pet_id: pet.id, storage_path: fileName, url: publicUrl, is_primary: false, order_index: pet.pet_photos?.length || 0, created_at: new Date().toISOString() } as PetPhoto] } : null);
  };

  const handleDeletePet = async () => {
    if (!pet || !confirm('Request to delete this profile?')) return;
    await supabase.from('pets').update({ delete_requested: true, delete_requested_at: new Date().toISOString() }).eq('id', pet.id);
    router.push('/pets');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-pulse">🐾</span>
          <p className="text-[#86868b] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🐾</span>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mt-4">Profile not found</h2>
          <Link href="/pets" className="text-[#0071e3] mt-4 inline-block">Back to pets</Link>
        </div>
      </div>
    );
  }

  const primaryPhoto = pet.pet_photos?.find((p: any) => p.is_primary) || pet.pet_photos?.[0];
  const scoreData = calculateMultiSourceScore({
    reviews: reviewsToScoringFormat(reviews),
    checkins,
    verifications,
    assessments,
    options: { hasKciCertificate: pet.has_kci_certificate },
  });

  const hasCert = pet.has_kci_certificate;
  const allBreeds = [...DOG_BREEDS, ...CAT_BREEDS];
  const breedLabel = pet.breed ? allBreeds.find(b => b.value === pet.breed)?.label || pet.breed : null;

  // Build score sources for elegant display
  const scoreSources = scoreData.scoreBreakdown.map(s => {
    const icons: Record<string, string> = {
      'Reviews': '⭐',
      'Business Check-ins': '🏪',
      'Neighbor Verifications': '👥',
      'Behavioral Assessments': '📋',
    };
    return {
      label: s.category,
      score: s.percentage,
      count: s.totalReviews,
      icon: icons[s.category] || '📊',
    };
  });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center text-[#86868b] hover:text-[#1d1d1f]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link href={`/pets/${pet.id}/edit`}>
                <button className="px-4 py-1.5 text-[13px] font-medium rounded-full bg-[#fafafa] text-[#1d1d1f]">Edit</button>
              </Link>
              <button onClick={handleDeletePet} className="px-4 py-1.5 text-[13px] font-medium rounded-full bg-[#ff3b30]/10 text-[#ff3b30]">Delete</button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Photo Section */}
          <div className="space-y-4">
            <div className="relative">
              <div className={`relative aspect-square rounded-3xl overflow-hidden ${hasCert ? 'ring-4 ring-[#d4af37]' : ''}`}>
                {primaryPhoto ? (
                  <img src={primaryPhoto.url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#f5f5f7] flex items-center justify-center">
                    <span className="text-9xl">{getSpeciesEmoji(pet.species)}</span>
                  </div>
                )}
              </div>
              {hasCert && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#d4af37] via-[#f4e4ba] to-[#d4af37] px-6 py-2 rounded-full shadow-lg">
                  <span className="text-[13px] font-semibold text-[#1d1d1f]">✓ Certified Profile</span>
                </div>
              )}
            </div>

            {pet.pet_photos && pet.pet_photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {pet.pet_photos.map((photo, i) => (
                  <button key={photo.id} onClick={() => setActivePhoto(i)} className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ${activePhoto === i ? 'ring-2 ring-[#1d1d1f]' : ''}`}>
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {isOwner && (
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-black/10 flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-[#1d1d1f]">
                    <span className="text-[#86868b]">+</span>
                    <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
                  </label>
                )}
              </div>
            )}

            <Card padding="lg">
              <div className="text-center">
                <p className="text-[13px] text-[#86868b] mb-4">Share this profile</p>
                <div className="flex justify-center">
                  <QRCode publicId={pet.public_id} petName={pet.name} size={140} showDownload />
                </div>
              </div>
            </Card>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">{pet.name}</h1>
                  <p className="text-[#86868b] mt-1">
                    {breedLabel || SPECIES_OPTIONS.find(s => s.value === pet.species)?.label}
                    {pet.age_months ? ` • ${formatAge(pet.age_months)}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {pet.size && <span className="px-3 py-1 bg-[#f5f5f7] rounded-full text-[12px] font-medium text-[#1d1d1f]">{pet.size}</span>}
                {pet.gender && <span className="px-3 py-1 bg-[#f5f5f7] rounded-full text-[12px] font-medium text-[#1d1d1f]">{pet.gender === 'male' ? '♂' : pet.gender === 'female' ? '♀' : ''} {GENDER_OPTIONS.find(g => g.value === pet.gender)?.label}</span>}
                <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${pet.vaccination_status === 'up_to_date' ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#ff9500]/10 text-[#ff9500]'}`}>
                  💉 {VACCINATION_OPTIONS.find(v => v.value === pet.vaccination_status)?.label}
                </span>
              </div>
            </div>

            {pet.bio && (
              <Card padding="lg">
                <p className="text-[15px] text-[#1d1d1f] leading-relaxed">{pet.bio}</p>
              </Card>
            )}

            {/* Elegant Score Card */}
            <ElegantScoreCard
              score={scoreData.overallScore}
              totalRatings={scoreData.totalReviews}
              sources={scoreSources}
            />

            {pet.special_needs && (
              <Card padding="lg" className="bg-[#ff9500]/5 border-[#ff9500]/20">
                <h3 className="text-[15px] font-semibold text-[#ff9500]">⚠️ Special Needs</h3>
                <p className="text-[14px] text-[#1d1d1f] mt-2">{pet.special_needs}</p>
              </Card>
            )}

            {isOwner && (
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/pet/${pet.public_id}`)}>
                  Share
                </Button>
                <Link href={`/pets/${pet.id}/reviews`} className="flex-1">
                  <Button size="lg" className="w-full">Write Review</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.slice(0, 5).map(review => (
                <ReviewCard key={review.id} review={review} showPet={false} showActions={false} />
              ))}
              {reviews.length > 5 && (
                <Link href={`/pets/${pet.id}/reviews`} className="block text-center text-[#0071e3]">
                  View all {reviews.length} reviews
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-black/5">
              <span className="text-4xl">⭐</span>
              <p className="text-[#86868b] mt-4">No reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
