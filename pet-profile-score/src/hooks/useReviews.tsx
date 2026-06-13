'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { calculateReviewScore, calculatePetOverallScore, reviewsToScoringFormat } from '@/lib/utils/scoring';
import type { Review, CreateReviewForm, PetScore } from '@/types/database';

interface UseReviewsReturn {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  fetchReviews: (petId?: string) => Promise<void>;
  fetchReview: (id: string) => Promise<Review | null>;
  createReview: (data: CreateReviewForm) => Promise<{ review?: Review; error?: string }>;
  updateReview: (id: string, data: Partial<Review>) => Promise<{ review?: Review; error?: string }>;
  deleteReview: (id: string) => Promise<{ error?: string }>;
  flagReview: (reviewId: string, reason: string) => Promise<{ error?: string }>;
  voteReview: (reviewId: string, voteType: 'helpful' | 'not_helpful') => Promise<{ error?: string }>;
  calculateScore: (petId: string) => Promise<PetScore | null>;
}

export function useReviews(): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchReviews = useCallback(async (petId?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          pet:pets!reviews_pet_id_fkey(id, name, species, public_id),
          reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url),
          business:businesses!reviews_business_id_fkey(id, business_name)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (petId) {
        query = query.eq('pet_id', petId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReview = useCallback(async (id: string): Promise<Review | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          pet:pets!reviews_pet_id_fkey(id, name, species, public_id),
          reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url),
          business:businesses!reviews_business_id_fkey(id, business_name)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch review');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReview = useCallback(async (data: CreateReviewForm): Promise<{ review?: Review; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };

      // Calculate overall score
      const overallScore = calculateReviewScore({
        friendliness_humans: data.friendliness_humans,
        friendliness_pets: data.friendliness_pets,
        barking_issues: data.barking_issues,
        aggression_issues: data.aggression_issues,
        public_behavior: data.public_behavior,
        restaurant_behavior: data.restaurant_behavior,
        travel_behavior: data.travel_behavior,
        cleanliness: data.cleanliness,
        leash_discipline: data.leash_discipline,
      });

      const { data: review, error: createError } = await supabase
        .from('reviews')
        .insert({
          pet_id: data.pet_id,
          reviewer_id: user.id,
          friendliness_humans: data.friendliness_humans,
          friendliness_pets: data.friendliness_pets,
          barking_issues: data.barking_issues,
          aggression_issues: data.aggression_issues,
          public_behavior: data.public_behavior,
          restaurant_behavior: data.restaurant_behavior,
          travel_behavior: data.travel_behavior,
          cleanliness: data.cleanliness,
          leash_discipline: data.leash_discipline,
          overall_score: overallScore,
          review_text: data.review_text || null,
          photo_urls: data.photo_urls || null,
          reviewer_type: data.reviewer_type,
          visit_date: data.visit_date || null,
          location_name: data.location_name || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update pet's total_reviews count
      await supabase.rpc('increment_pet_reviews', { pet_id: data.pet_id });

      // Add to local state
      setReviews(prev => [review, ...prev]);

      return { review };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create review';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReview = useCallback(async (id: string, data: Partial<Review>): Promise<{ review?: Review; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: review, error: updateError } = await supabase
        .from('reviews')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setReviews(prev => prev.map(r => r.id === id ? { ...r, ...review } : r));

      return { review };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update review';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (id: string): Promise<{ error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setReviews(prev => prev.filter(r => r.id !== id));

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete review';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const flagReview = useCallback(async (reviewId: string, reason: string): Promise<{ error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };

      const { error: flagError } = await supabase
        .from('reviews')
        .update({
          is_flagged: true,
          flag_reason: reason,
          flagged_by: user.id,
          flagged_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (flagError) throw flagError;

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to flag review';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const voteReview = useCallback(async (reviewId: string, voteType: 'helpful' | 'not_helpful'): Promise<{ error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };

      // Check if already voted
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('voter_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        await supabase
          .from('review_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
      } else {
        // Create new vote
        await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            voter_id: user.id,
            vote_type: voteType,
          });
      }

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to vote';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateScore = useCallback(async (petId: string): Promise<PetScore | null> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('pet_id', petId)
        .eq('is_approved', true);

      if (error) throw error;

      const scoringFormat = reviewsToScoringFormat(data || []);
      return calculatePetOverallScore(scoringFormat);
    } catch (err) {
      console.error('Failed to calculate score:', err);
      return null;
    }
  }, []);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    fetchReview,
    createReview,
    updateReview,
    deleteReview,
    flagReview,
    voteReview,
    calculateScore,
  };
}
