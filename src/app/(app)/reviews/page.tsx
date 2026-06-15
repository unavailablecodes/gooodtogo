'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Star, Calendar, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import type { Review, Pet } from '@/types/database';

export default function MyReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<(Review & { pet?: Pet })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;

      setLoading(true);
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          pet:pets!reviews_pet_id_fkey(id, name, public_id, species)
        `)
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false });

      setReviews(data || []);
      setLoading(false);
    };

    fetchReviews();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
        <p className="text-gray-600 mt-1">Reviews you have written for pets</p>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h2>
          <p className="text-gray-600">You have not written any reviews for pets.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                <Avatar
                  src={undefined}
                  name={review.pet?.name || 'Pet'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.pet?.name || 'Unknown Pet'}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{review.overall_score.toFixed(1)}</span>
                    </div>
                  </div>

                  {review.review_text && (
                    <p className="mt-3 text-gray-700">{review.review_text}</p>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <Link href={'/pet/' + (review.pet?.public_id || '')}>
                      <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        View Pet Profile
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
