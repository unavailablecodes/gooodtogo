'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import { formatRelativeTime, getSpeciesEmoji } from '@/lib/utils/format';
import { REVIEWER_TYPE_OPTIONS } from '@/lib/constants/categories';
import type { Review } from '@/types/database';
import { ThumbsUp, ThumbsDown, Flag, MapPin, Calendar } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  showPet?: boolean;
  onVote?: (type: 'helpful' | 'not_helpful') => void;
  onFlag?: () => void;
  showActions?: boolean;
}

export function ReviewCard({ review, showPet = false, onVote, onFlag, showActions = true }: ReviewCardProps) {
  const reviewerTypeLabel = REVIEWER_TYPE_OPTIONS.find(t => t.value === review.reviewer_type)?.label || review.reviewer_type;

  // Calculate overall stars (convert 0-100 score to 1-5 stars)
  const overallStars = Math.round((review.overall_score / 100) * 5);

  return (
    <Card className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={review.reviewer?.avatar_url}
            name={review.reviewer?.full_name}
            size="md"
          />
          <div>
            <p className="font-medium text-gray-900">
              {review.reviewer?.full_name || 'Anonymous'}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Badge variant="default" size="sm">{reviewerTypeLabel}</Badge>
              {review.location_name && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {review.location_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <StarRating value={overallStars} readonly size="sm" />
          <p className="text-xs text-gray-400 mt-1">
            {formatRelativeTime(review.created_at)}
          </p>
        </div>
      </div>

      {/* Pet Info */}
      {showPet && review.pet && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-4">
          <span className="text-2xl">{getSpeciesEmoji(review.pet.species)}</span>
          <div>
            <p className="font-medium text-sm">{review.pet.name}</p>
            <p className="text-xs text-gray-500">ID: {review.pet.public_id}</p>
          </div>
        </div>
      )}

      {/* Review Text */}
      {review.review_text && (
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.review_text}</p>
      )}

      {/* Visit Date */}
      {review.visit_date && (
        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          Visited on {new Date(review.visit_date).toLocaleDateString()}
        </p>
      )}

      {/* Actions */}
      {showActions && (onVote || onFlag) && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          {onVote && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onVote('helpful')}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Helpful"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onVote('not_helpful')}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Not Helpful"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          )}
          {onFlag && (
            <button
              onClick={onFlag}
              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors ml-auto"
              title="Report Review"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
