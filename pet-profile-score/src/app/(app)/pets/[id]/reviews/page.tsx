'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { REVIEWER_TYPE_OPTIONS, SCORING_CATEGORIES } from '@/lib/constants/categories';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface PetInfo {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  public_id: string;
  owner_id: string;
}

export default function WriteReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const petId = params.id as string;
  const supabase = createClient();

  const [pet, setPet] = useState<PetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [reviewData, setReviewData] = useState({
    friendliness_humans: 3,
    friendliness_pets: 3,
    barking_issues: 3,
    aggression_issues: 3,
    public_behavior: 3,
    restaurant_behavior: 3,
    travel_behavior: 3,
    cleanliness: 3,
    leash_discipline: 3,
    review_text: '',
    reviewer_type: 'pet_parent',
    visit_date: '',
    location_name: '',
  });

  useEffect(() => {
    const fetchPet = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('pets')
        .select('id, name, species, breed, public_id, owner_id')
        .eq('id', petId)
        .single();

      if (data) {
        setPet(data as PetInfo);

        // Check if user is the owner
        if (data.owner_id === user?.id) {
          setError('You cannot review your own pet.');
        }
      }

      setLoading(false);
    };

    fetchPet();
  }, [petId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    if (pet?.owner_id === user.id) {
      setError('You cannot review your own pet.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Calculate overall score
      let total = 0;
      let count = 0;
      for (const cat of SCORING_CATEGORIES) {
        const score = reviewData[cat.key as keyof typeof reviewData];
        if (typeof score === 'number') {
          total += score;
          count++;
        }
      }
      const overallScore = count > 0 ? (total / count / 5) * 100 : 0;

      const { error: insertError } = await supabase.from('reviews').insert({
        pet_id: petId,
        reviewer_id: user.id,
        friendliness_humans: reviewData.friendliness_humans,
        friendliness_pets: reviewData.friendliness_pets,
        barking_issues: reviewData.barking_issues,
        aggression_issues: reviewData.aggression_issues,
        public_behavior: reviewData.public_behavior,
        restaurant_behavior: reviewData.restaurant_behavior,
        travel_behavior: reviewData.travel_behavior,
        cleanliness: reviewData.cleanliness,
        leash_discipline: reviewData.leash_discipline,
        overall_score: overallScore,
        review_text: reviewData.review_text || null,
        reviewer_type: reviewData.reviewer_type,
        visit_date: reviewData.visit_date || null,
        location_name: reviewData.location_name || null,
      });

      if (insertError) throw insertError;

      router.push(`/pets/${petId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet Not Found</h2>
        <p className="text-gray-600">This pet profile doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review {pet.name}</h1>
        <p className="text-gray-600">
          Share your experience with {pet.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Reviewer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="I am a..."
              options={REVIEWER_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              value={reviewData.reviewer_type}
              onChange={(e) => setReviewData(prev => ({ ...prev, reviewer_type: e.target.value }))}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Location (Optional)"
                placeholder="e.g., Central Park Cafe"
                value={reviewData.location_name}
                onChange={(e) => setReviewData(prev => ({ ...prev, location_name: e.target.value }))}
              />

              <Input
                label="Visit Date (Optional)"
                type="date"
                value={reviewData.visit_date}
                onChange={(e) => setReviewData(prev => ({ ...prev, visit_date: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rating Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Rate {pet.name}</CardTitle>
            <CardDescription>
              Rate this pet's behavior in different categories. Higher ratings indicate better behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {SCORING_CATEGORIES.map((category) => (
              <div key={category.key} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium text-gray-900">{category.label}</span>
                  </div>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating
                    value={reviewData[category.key as keyof typeof reviewData] as number}
                    onChange={(value) => setReviewData(prev => ({ ...prev, [category.key]: value }))}
                    size="md"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Written Review */}
        <Card>
          <CardHeader>
            <CardTitle>Your Review (Optional)</CardTitle>
            <CardDescription>
              Share additional details about your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Tell us about your experience with this pet..."
              value={reviewData.review_text}
              onChange={(e) => setReviewData(prev => ({ ...prev, review_text: e.target.value }))}
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-2">
              {reviewData.review_text.length}/1000 characters
            </p>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent>
            <h4 className="font-semibold text-blue-900 mb-2">Review Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be honest and fair in your assessment</li>
              <li>• Focus on the pet's behavior, not personal opinions</li>
              <li>• Provide constructive feedback</li>
              <li>• Only review based on your own experience</li>
            </ul>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={submitting}
            disabled={pet?.owner_id === user?.id}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </div>
  );
}
