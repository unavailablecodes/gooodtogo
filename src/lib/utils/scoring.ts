import { SCORING_CATEGORIES, type ScoringCategoryKey } from '@/lib/constants/categories';
import type { PetScore, CategoryScore, BusinessCheckin, NeighborVerification, BehavioralAssessment } from '@/types/database';

interface ReviewScores {
  friendliness_humans: number;
  friendliness_pets: number;
  barking_issues: number;
  aggression_issues: number;
  public_behavior: number;
  restaurant_behavior: number;
  travel_behavior: number;
  cleanliness: number;
  leash_discipline: number;
}

interface ReviewWithMeta {
  scores: ReviewScores;
  created_at: string;
  reviewer_credibility_score: number;
  is_verified_visit?: boolean;
  is_flagged?: boolean;
}

// Invert scores where higher number = worse behavior
function normalizeScore(score: number, isInverted: boolean): number {
  return isInverted ? (6 - score) : score;
}

// Calculate single review's overall score
export function calculateReviewScore(scores: ReviewScores): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const category of SCORING_CATEGORIES) {
    const score = scores[category.key as ScoringCategoryKey];
    if (score === undefined || score === null) continue;

    const normalizedScore = normalizeScore(score, category.inverted);
    const weight = category.weight;

    weightedSum += normalizedScore * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
}

// Calculate pet's multi-source score
export function calculateMultiSourceScore(data: {
  reviews?: ReviewWithMeta[];
  checkins?: BusinessCheckin[];
  verifications?: NeighborVerification[];
  assessments?: BehavioralAssessment[];
  options?: {
    hasKciCertificate?: boolean;
    isVerifiedPet?: boolean;
  };
}): PetScore {
  const { reviews = [], checkins = [], verifications = [], assessments = [], options } = data;

  // Source weights
  const WEIGHTS = {
    reviews: 0.40,       // 40% - Reviews
    checkins: 0.25,      // 25% - Business check-ins
    verifications: 0.20, // 20% - Neighbor verifications
    assessments: 0.15,  // 15% - Behavioral assessments
  };

  const sourceScores: { source: string; score: number; count: number; weight: number }[] = [];

  // 1. Reviews Score (40%)
  if (reviews.length > 0) {
    const now = Date.now();
    let weightedSum = 0;
    let totalWeight = 0;

    for (const review of reviews) {
      const ageInDays = (now - new Date(review.created_at).getTime()) / (24 * 60 * 60 * 1000);
      let timeDecay = ageInDays > 30 ? Math.max(0.5, 1 - (ageInDays - 30) / 335) : 1.0;
      if (review.is_flagged) timeDecay *= 0.7;

      const credibilityWeight = review.reviewer_credibility_score;
      const verifiedBonus = review.is_verified_visit ? 1.15 : 1.0;
      const combinedWeight = timeDecay * credibilityWeight * verifiedBonus;

      let reviewScore = 0;
      let catWeight = 0;
      for (const cat of SCORING_CATEGORIES) {
        const score = review.scores[cat.key as ScoringCategoryKey];
        if (score === undefined || score === null) continue;
        const normalizedScore = normalizeScore(score, cat.inverted);
        reviewScore += normalizedScore * cat.weight;
        catWeight += cat.weight;
      }

      if (catWeight > 0) {
        weightedSum += (reviewScore / catWeight / 5) * 100 * combinedWeight;
        totalWeight += combinedWeight;
      }
    }

    if (totalWeight > 0) {
      sourceScores.push({
        source: 'Reviews',
        score: Math.round((weightedSum / totalWeight) * 10) / 10,
        count: reviews.length,
        weight: WEIGHTS.reviews,
      });
    }
  }

  // 2. Business Check-ins Score (25%)
  if (checkins.length > 0) {
    let totalScore = 0;
    let count = 0;

    for (const checkin of checkins) {
      if (checkin.overall_rating) {
        // Base score from rating
        let score = (checkin.overall_rating / 5) * 100;

        // Adjustments based on behavior flags
        if (checkin.was_aggressive) score -= 20;
        if (checkin.was_noisy) score -= 10;
        if (!checkin.was_friendly) score -= 10;
        if (!checkin.cleaned_up_after) score -= 5;
        if (!checkin.would_allow_again) score -= 15;

        score = Math.max(0, Math.min(100, score));
        totalScore += score;
        count++;
      }
    }

    if (count > 0) {
      sourceScores.push({
        source: 'Business Check-ins',
        score: Math.round((totalScore / count) * 10) / 10,
        count,
        weight: WEIGHTS.checkins,
      });
    }
  }

  // 3. Neighbor Verifications Score (20%)
  if (verifications.length > 0) {
    let totalScore = 0;
    let count = 0;

    for (const ver of verifications) {
      let score = 70; // Base score
      if (ver.friendly_rating) score = Math.max(score, (ver.friendly_rating / 5) * 100);
      if (ver.quiet_rating) score = Math.max(score, (ver.quiet_rating / 5) * 100);
      if (ver.well_behaved) score += 10;

      // More interactions = more weight
      score = Math.min(100, score + (ver.interaction_count - 1) * 2);

      totalScore += score;
      count++;
    }

    if (count > 0) {
      sourceScores.push({
        source: 'Neighbor Verifications',
        score: Math.round((totalScore / count) * 10) / 10,
        count,
        weight: WEIGHTS.verifications,
      });
    }
  }

  // 4. Behavioral Assessments Score (15%)
  if (assessments.length > 0) {
    let totalScore = 0;
    let count = 0;

    for (const assess of assessments) {
      if (assess.score) {
        let score = (assess.score / 5) * 100;

        // Average of sub-scores
        const subScores = [assess.leash_control, assess.obedience_level, assess.social_skills, assess.anxiety_level].filter(s => s !== null) as number[];
        if (subScores.length > 0) {
          const subAvg = subScores.reduce((a, b) => a + b, 0) / subScores.length;
          score = (score + (subAvg / 5) * 100) / 2;
        }

        totalScore += score;
        count++;
      }
    }

    if (count > 0) {
      sourceScores.push({
        source: 'Behavioral Assessments',
        score: Math.round((totalScore / count) * 10) / 10,
        count,
        weight: WEIGHTS.assessments,
      });
    }
  }

  // Calculate weighted overall score
  let overallScore = 0;
  let totalWeight = 0;

  for (const src of sourceScores) {
    overallScore += src.score * src.weight;
    totalWeight += src.weight;
  }

  if (totalWeight > 0) {
    overallScore = overallScore / totalWeight;
  }

  // Apply bonuses
  if (options?.hasKciCertificate) {
    overallScore = Math.min(96, overallScore + 2);
  }
  if (options?.isVerifiedPet) {
    overallScore = Math.min(96, overallScore + 1);
  }
  if (reviews.length >= 10 || checkins.length >= 5) {
    overallScore = Math.min(96, overallScore + 1);
  }

  // Cap at 96
  overallScore = Math.min(96, Math.max(0, overallScore));

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    totalReviews: reviews.length + checkins.length + verifications.length + assessments.length,
    scoreBreakdown: sourceScores.map(s => ({
      category: s.source,
      score: s.score,
      percentage: s.score,
      totalReviews: s.count,
    })),
  };
}

// Legacy function - kept for backwards compatibility
export function calculatePetOverallScore(reviews: ReviewWithMeta[], options?: { hasKciCertificate?: boolean; isVerifiedPet?: boolean }): PetScore {
  return calculateMultiSourceScore({ reviews, options });
}

// Calculate reviewer credibility score
export function calculateCredibilityScore(stats: {
  totalReviews: number;
  helpfulVotes: number;
  falseReportCount: number;
  accountAgeDays: number;
  verifiedAccount: boolean;
}): number {
  let score = 1.0;

  score += Math.min(stats.totalReviews * 0.02, 0.5);
  score += Math.min(stats.helpfulVotes * 0.01, 0.3);
  score -= Math.min(stats.falseReportCount * 0.1, 0.5);
  score += Math.min(stats.accountAgeDays * 0.001, 0.2);
  if (stats.verifiedAccount) score += 0.2;

  return Math.max(0.1, Math.min(2.0, Math.round(score * 100) / 100));
}

// Get score color based on percentage
export function getScoreColor(percentage: number): string {
  if (percentage >= 90) return '#34c759';
  if (percentage >= 70) return '#30d158';
  if (percentage >= 50) return '#ffd60a';
  if (percentage >= 30) return '#ff9f0a';
  return '#ff453a';
}

// Get score label based on percentage
export function getScoreLabel(percentage: number): string {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 70) return 'Very Good';
  if (percentage >= 50) return 'Good';
  if (percentage >= 30) return 'Needs Work';
  if (percentage > 0) return 'Building Trust';
  return 'No Data';
}

// Get star rating (0-5 scale)
export function getStarRating(percentage: number): number {
  return Math.round((percentage / 100) * 5 * 10) / 10;
}

// Get star array for display
export function getStarArray(percentage: number): ('full' | 'half' | 'empty')[] {
  const stars = getStarRating(percentage);
  const result: ('full' | 'half' | 'empty')[] = [];

  for (let i = 1; i <= 5; i++) {
    if (stars >= i) {
      result.push('full');
    } else if (stars >= i - 0.5) {
      result.push('half');
    } else {
      result.push('empty');
    }
  }

  return result;
}

// Convert Review array to ReviewWithMeta format
export function reviewsToScoringFormat(reviews: Array<{
  friendliness_humans?: number | null;
  friendliness_pets?: number | null;
  barking_issues?: number | null;
  aggression_issues?: number | null;
  public_behavior?: number | null;
  restaurant_behavior?: number | null;
  travel_behavior?: number | null;
  cleanliness?: number | null;
  leash_discipline?: number | null;
  created_at: string;
  reviewer_credibility_score?: number;
  is_verified_visit?: boolean;
  is_flagged?: boolean;
}>): ReviewWithMeta[] {
  return reviews.map(r => ({
    scores: {
      friendliness_humans: r.friendliness_humans ?? 3,
      friendliness_pets: r.friendliness_pets ?? 3,
      barking_issues: r.barking_issues ?? 3,
      aggression_issues: r.aggression_issues ?? 3,
      public_behavior: r.public_behavior ?? 3,
      restaurant_behavior: r.restaurant_behavior ?? 3,
      travel_behavior: r.travel_behavior ?? 3,
      cleanliness: r.cleanliness ?? 3,
      leash_discipline: r.leash_discipline ?? 3,
    },
    created_at: r.created_at,
    reviewer_credibility_score: r.reviewer_credibility_score ?? 1.0,
    is_verified_visit: r.is_verified_visit ?? false,
    is_flagged: r.is_flagged ?? false,
  }));
}
