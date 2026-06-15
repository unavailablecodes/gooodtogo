'use client';

import { formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Store, Calendar, Check, X } from 'lucide-react';
import type { BusinessCheckin } from '@/types/database';

interface BusinessCheckinListProps {
  checkins: BusinessCheckin[];
  showDate?: boolean;
}

export function BusinessCheckinList({ checkins, showDate = true }: BusinessCheckinListProps) {
  if (checkins.length === 0) {
    return (
      <div className="text-center py-6">
        <Store className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No business check-ins yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Store className="w-4 h-4" />
        <span>{checkins.length} business check-in{checkins.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {checkins.slice(0, 10).map((checkin) => (
          <div
            key={checkin.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${checkin.overall_rating && checkin.overall_rating >= 4 ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Store className={`w-5 h-5 ${checkin.overall_rating && checkin.overall_rating >= 4 ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {checkin.business_name || 'Local Business'}
                </p>
                {checkin.overall_rating && (
                  <Badge variant={checkin.overall_rating >= 4 ? 'success' : 'warning'}>
                    {checkin.overall_rating}/5
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {checkin.was_friendly && (
                  <span className="text-xs text-green-600">😊 Friendly</span>
                )}
                {checkin.was_aggressive && (
                  <span className="text-xs text-red-600">⚠️ Aggressive</span>
                )}
                {checkin.was_noisy && (
                  <span className="text-xs text-yellow-600">🔊 Noisy</span>
                )}
                {checkin.would_allow_again && (
                  <span className="text-xs text-green-600">👍 Would allow again</span>
                )}
                {!checkin.would_allow_again && (
                  <span className="text-xs text-red-600">👎 Would not allow again</span>
                )}
              </div>
              {showDate && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {formatDate(checkin.visit_date)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {checkins.length > 10 && (
        <p className="text-xs text-gray-500 text-center pt-2">
          + {checkins.length - 10} more check-ins
        </p>
      )}
    </div>
  );
}
