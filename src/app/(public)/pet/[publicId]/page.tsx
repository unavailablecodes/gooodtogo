'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ScoreDisplay, ScoreBreakdown } from '@/components/ui/ScoreDisplay';
import { ReviewCard } from '@/components/review/ReviewCard';
import { NeighborVerificationForm } from '@/components/verify/NeighborVerificationForm';
import { NeighborVerificationList } from '@/components/verify/NeighborVerificationList';
import { calculatePetOverallScore, reviewsToScoringFormat } from '@/lib/utils/scoring';
import { formatAge, getSpeciesEmoji, getVaccinationColor } from '@/lib/utils/format';
import { SPECIES_OPTIONS, SIZE_OPTIONS, GENDER_OPTIONS, VACCINATION_OPTIONS } from '@/lib/constants/categories';
import { ArrowLeft, MapPin, Calendar, Check, Mail, Phone, ExternalLink, Users } from 'lucide-react';
import type { Pet, Review, NeighborVerification } from '@/types/database';

export default function PublicPetPage() {
  const params = useParams();
  const publicId = params.publicId as string;
  const supabase = createClient();

  const [pet, setPet] = useState<Pet | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [verifications, setVerifications] = useState<NeighborVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setNotFound(false);

      // Fetch pet by public ID
      const { data: petData } = await supabase
        .from('pets')
        .select(`
          *,
          owner:profiles!pets_owner_id_fkey(id, full_name, avatar_url, phone, show_contact_details),
          pet_photos(*)
        `)
        .eq('public_id', publicId)
        .eq('is_active', true)
        .single();

      if (!petData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Check visibility
      if (petData.profile_visibility === 'hidden') {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPet(petData);

      // Fetch approved reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)
        `)
        .eq('pet_id', petData.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);

      // Fetch neighbor verifications
      const { data: verificationsData } = await supabase
        .from('neighbor_verifications')
        .select('*')
        .eq('pet_id', petData.id)
        .order('created_at', { ascending: false });

      setVerifications(verificationsData || []);
      setLoading(false);
    };

    if (publicId) {
      fetchData();
    }
  }, [publicId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="aspect-video bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (notFound || !pet) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">🐾</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet Not Found</h2>
        <p className="text-gray-600 mb-6">
          This pet profile doesn't exist, has been removed, or is not publicly visible.
        </p>
        <Link href="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  const primaryPhoto = pet.pet_photos?.find((p: any) => p.is_primary) || pet.pet_photos?.[0];
  const scoreData = calculatePetOverallScore(reviewsToScoringFormat(reviews));

  const speciesLabel = SPECIES_OPTIONS.find(s => s.value === pet.species)?.label || pet.species;
  const genderLabel = pet.gender ? GENDER_OPTIONS.find(g => g.value === pet.gender)?.label : null;
  const sizeLabel = pet.size ? SIZE_OPTIONS.find(s => s.value === pet.size)?.label : null;
  const vaccineLabel = VACCINATION_OPTIONS.find(v => v.value === pet.vaccination_status)?.label || pet.vaccination_status;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <Badge variant="info">{pet.public_id}</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Photo */}
        <div className="space-y-6">
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
            {primaryPhoto ? (
              <img
                src={primaryPhoto.url}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {getSpeciesEmoji(pet.species)}
              </div>
            )}
            {pet.is_verified && (
              <Badge variant="success" className="absolute top-4 left-4">
                <Check className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Contact Owner */}
          {pet.owner?.show_contact_details && (
            <Card>
              <CardTitle>Contact Owner</CardTitle>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar src={pet.owner.avatar_url} name={pet.owner.full_name} size="md" />
                  <span className="font-medium">{pet.owner.full_name}</span>
                </div>
                <div className="flex gap-2">
                  {pet.owner.email && (
                    <a href={`mailto:${pet.owner.email}`}>
                      <Button variant="outline" size="sm" leftIcon={<Mail className="w-4 h-4" />}>
                        Email
                      </Button>
                    </a>
                  )}
                  {pet.owner.phone && (
                    <a href={`tel:${pet.owner.phone}`}>
                      <Button variant="outline" size="sm" leftIcon={<Phone className="w-4 h-4" />}>
                        Call
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pet.name}</h1>
            <p className="text-lg text-gray-600">
              {pet.breed || speciesLabel}
              {genderLabel && ` • ${genderLabel}`}
              {pet.age_months && ` • ${formatAge(pet.age_months)}`}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {sizeLabel && <Badge variant="info">{sizeLabel}</Badge>}
              <Badge variant={pet.vaccination_status === 'up_to_date' ? 'success' : 'warning'}>
                💉 {vaccineLabel}
              </Badge>
            </div>
          </div>

          {/* Score */}
          {pet.overall_score > 0 ? (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Social Score</CardTitle>
                <ScoreDisplay score={pet.overall_score} size="md" />
              </div>
              {scoreData.scoreBreakdown.length > 0 && (
                <ScoreBreakdown categories={scoreData.scoreBreakdown} />
              )}
              <p className="text-sm text-gray-500 mt-4">
                Based on {scoreData.totalReviews} review{scoreData.totalReviews !== 1 ? 's' : ''}
              </p>
            </Card>
          ) : (
            <Card className="text-center py-8">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-gray-600">No reviews yet</p>
              <p className="text-sm text-gray-500">Be the first to review this pet!</p>
            </Card>
          )}

          {/* Neighbor Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Neighbor Verifications
            </h3>
            <NeighborVerificationForm petId={pet.id} petName={pet.name} />
            {verifications.length > 0 && (
              <NeighborVerificationList verifications={verifications} showDate={true} />
            )}
          </div>

          {/* Bio */}
          {pet.bio && (
            <Card>
              <CardTitle>About {pet.name}</CardTitle>
              <p className="text-gray-700 mt-2">{pet.bio}</p>
            </Card>
          )}

          {/* Special Needs */}
          {pet.special_needs && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardTitle className="text-yellow-800">⚠️ Special Needs</CardTitle>
              <p className="text-yellow-700 mt-2">{pet.special_needs}</p>
            </Card>
          )}

          {/* Owner */}
          {pet.owner && pet.profile_visibility !== 'hidden' && (
            <Card>
              <CardTitle>Owner</CardTitle>
              <div className="flex items-center gap-3 mt-3">
                <Avatar src={pet.owner.avatar_url} name={pet.owner.full_name} size="md" />
                <div>
                  <p className="font-medium">{pet.owner.full_name}</p>
                  {pet.owner.show_contact_details && (
                    <p className="text-sm text-gray-500">Contact details available</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* QR Code Link */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">View this profile on Pet Profile Score</p>
            <Link href={`/pet/${pet.public_id}`}>
              <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
                {window.location.origin}/pet/{pet.public_id}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Reviews ({reviews.length})
        </h2>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} showPet={false} showActions={false} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <div className="text-4xl mb-3">⭐</div>
            <p className="text-gray-600">No reviews yet</p>
            <p className="text-sm text-gray-500">Be the first to share your experience!</p>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span className="text-2xl">🐾</span>
          <span className="font-semibold">Pet Profile Score</span>
        </Link>
        <p className="text-sm text-gray-500 mt-2">
          Trusted pet behavior profiles for pet-friendly businesses
        </p>
      </div>
    </div>
  );
}
