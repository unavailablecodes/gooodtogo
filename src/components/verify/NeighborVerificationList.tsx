'use client';

import { formatDistanceToNow, formatDate } from '@/lib/utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { Check, X, Users, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { NeighborVerification } from '@/types/database';

interface NeighborVerificationListProps {
  verifications: NeighborVerification[];
  showDate?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
}

export function NeighborVerificationList({ verifications, showDate = true, isOwner = false, isAdmin = false }: NeighborVerificationListProps) {
  if (verifications.length === 0) {
    return (
      <div className="text-center py-6">
        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No neighbor verifications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Users className="w-4 h-4" />
        <span>{verifications.length} neighbor{verifications.length !== 1 ? 's' : ''} verified this pet</span>
      </div>

      <div className="space-y-2">
        {verifications.slice(0, 10).map((verification) => (
          <div
            key={verification.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
          >
            <Avatar
              src={undefined}
              name={verification.verifier_name || 'Anonymous'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {verification.verifier_name || 'Anonymous Neighbor'}
                </p>
                {verification.well_behaved ? (
                  <span className="text-xs text-green-600 font-medium">Would pet again ✅</span>
                ) : (
                  <span className="text-xs text-red-600 font-medium">Would not pet again ❌</span>
                )}
              </div>
              <p className="text-xs text-gray-500 capitalize">
                {verification.interaction_type.replace(/_/g, ' ')} • {verification.interaction_count}+ times
              </p>

              {/* Owner sees detailed ratings */}
              {isOwner && (
                <div className="flex flex-wrap gap-3 mt-2 text-xs">
                  <div className={`flex items-center gap-1 ${verification.friendly_rating && verification.friendly_rating >= 4 ? 'text-green-600' : 'text-red-600'}`}>
                    {verification.friendly_rating && verification.friendly_rating >= 4 ? (
                      <ThumbsUp className="w-3 h-3" />
                    ) : (
                      <ThumbsDown className="w-3 h-3" />
                    )}
                    Friendly: {verification.friendly_rating && verification.friendly_rating >= 4 ? 'Yes' : 'No'}
                  </div>
                  <div className={`flex items-center gap-1 ${verification.quiet_rating && verification.quiet_rating >= 4 ? 'text-green-600' : 'text-red-600'}`}>
                    {verification.quiet_rating && verification.quiet_rating >= 4 ? (
                      <ThumbsUp className="w-3 h-3" />
                    ) : (
                      <ThumbsDown className="w-3 h-3" />
                    )}
                    Quiet: {verification.quiet_rating && verification.quiet_rating >= 4 ? 'Yes' : 'No'}
                  </div>
                </div>
              )}

              {/* Notes for owner */}
              {isOwner && verification.notes && (
                <p className="text-xs text-gray-600 mt-2 italic">
                  "{verification.notes}"
                </p>
              )}

              {/* Date */}
              {showDate && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {formatDate(verification.created_at)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {verifications.length > 10 && (
        <p className="text-xs text-gray-500 text-center pt-2">
          + {verifications.length - 10} more verifications
        </p>
      )}
    </div>
  );
}
