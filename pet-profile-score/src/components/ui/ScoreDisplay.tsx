'use client';

import { getScoreColor, getScoreLabel, getStarArray } from '@/lib/utils/scoring';

interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  showStars?: boolean;
  showReviewCount?: boolean;
  totalReviews?: number;
  className?: string;
}

export function ScoreDisplay({
  score,
  size = 'md',
  showLabel = true,
  showStars = true,
  showReviewCount = false,
  totalReviews = 0,
  className = '',
}: ScoreDisplayProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const stars = getStarArray(score);

  const sizeStyles = {
    sm: { score: 'text-lg', stars: 'w-3 h-3', label: 'text-[11px]' },
    md: { score: 'text-2xl', stars: 'w-4 h-4', label: 'text-[12px]' },
    lg: { score: 'text-4xl', stars: 'w-5 h-5', label: 'text-[14px]' },
    xl: { score: 'text-6xl', stars: 'w-7 h-7', label: 'text-[16px]' },
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showStars && (
        <div className="flex items-center gap-1 mb-2">
          {stars.map((star, i) => (
            <svg
              key={i}
              className={`${sizeStyles[size].stars} ${color}`}
              viewBox="0 0 24 24"
              fill={star === 'full' ? 'currentColor' : star === 'half' ? 'url(#half)' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {star === 'half' && (
                <defs>
                  <linearGradient id="half">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      )}

      <div className="flex items-baseline gap-1">
        <span className={`font-semibold ${color} ${sizeStyles[size].score}`} style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
          {score > 0 ? score.toFixed(1) : '--'}
        </span>
        <span className="text-[#86868b] text-sm">/ 100</span>
      </div>

      {showLabel && (
        <span className={`font-medium ${color} ${sizeStyles[size].label} mt-1`}>
          {label}
        </span>
      )}

      {showReviewCount && totalReviews > 0 && (
        <span className="text-[#86868b] text-[11px] mt-1">
          Based on {totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'}
        </span>
      )}
    </div>
  );
}

interface ScoreBreakdownProps {
  categories: Array<{
    category: string;
    score: number;
    percentage: number;
    icon?: string;
  }>;
  className?: string;
}

export function ScoreBreakdown({ categories, className = '' }: ScoreBreakdownProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {categories.map((cat) => {
        const color = getScoreColor(cat.percentage);

        return (
          <div key={cat.category} className="flex items-center gap-3">
            <div className="w-6 text-center">
              {cat.icon && <span className="text-base">{cat.icon}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-[#1d1d1f] truncate">{cat.category}</span>
                <span className={`text-[13px] font-medium ml-2 ${color}`} style={{ fontWeight: 500 }}>
                  {cat.score.toFixed(0)}
                </span>
              </div>
              <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Apple/Tesla Style Elegant Score Card
interface ElegantScoreCardProps {
  score: number;
  totalRatings: number;
  sources: Array<{
    label: string;
    score: number;
    count: number;
    icon: string;
  }>;
  className?: string;
}

export function ElegantScoreCard({ score, totalRatings, sources, className = '' }: ElegantScoreCardProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const stars = getStarArray(score);

  return (
    <div className={`bg-white rounded-3xl p-6 border border-black/[0.04] ${className}`}>
      {/* Main Score */}
      <div className="flex items-start gap-6">
        {/* Score Circle */}
        <div className="relative flex-shrink-0">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(${color} ${score}%, #f5f5f7 0%)`,
            }}
          >
            <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center">
              <span className={`text-3xl font-semibold ${color}`} style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
                {score > 0 ? score.toFixed(0) : '--'}
              </span>
              <span className="text-[11px] text-[#86868b]">/ 100</span>
            </div>
          </div>
        </div>

        {/* Score Info */}
        <div className="flex-1">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight">Behavior Score</h3>
          <p className={`text-[14px] font-medium ${color} mt-0.5`}>{label}</p>

          {/* Stars */}
          <div className="flex items-center gap-0.5 mt-3">
            {stars.map((star, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${color}`}
                viewBox="0 0 24 24"
                fill={star === 'full' ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>

          <p className="text-[12px] text-[#86868b] mt-2">
            Based on {totalRatings} verified {totalRatings === 1 ? 'rating' : 'ratings'}
          </p>
        </div>
      </div>

      {/* Source Breakdown */}
      {sources.length > 0 && (
        <div className="mt-6 pt-6 border-t border-black/[0.04]">
          <h4 className="text-[13px] font-medium text-[#86868b] mb-4">Score Breakdown</h4>
          <div className="space-y-3">
            {sources.map((source, i) => {
              const sourceColor = getScoreColor(source.score);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#fafafa] flex items-center justify-center text-lg">
                    {source.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#1d1d1f]">{source.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[14px] font-semibold ${sourceColor}`} style={{ fontWeight: 600 }}>
                          {source.score.toFixed(0)}
                        </span>
                        <span className="text-[11px] text-[#86868b]">({source.count})</span>
                      </div>
                    </div>
                    <div className="h-1 bg-[#f5f5f7] rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${source.score}%`,
                          backgroundColor: sourceColor,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact Score Badge
export function ScoreBadge({ score, size = 'sm' }: { score: number; size?: 'sm' | 'md' }) {
  const color = getScoreColor(score);
  const stars = getStarArray(score);

  const sizeStyles = {
    sm: { badge: 'px-2.5 py-1', stars: 'w-3 h-3', score: 'text-sm' },
    md: { badge: 'px-3 py-1.5', stars: 'w-4 h-4', score: 'text-base' },
  };

  return (
    <div className={`inline-flex items-center gap-1.5 bg-[#fafafa] rounded-full ${sizeStyles[size].badge}`}>
      <div className="flex items-center gap-0.5">
        {stars.slice(0, 3).map((star, i) => (
          <svg
            key={i}
            className={`${sizeStyles[size].stars} ${color}`}
            viewBox="0 0 24 24"
            fill={star === 'full' ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className={`font-semibold ${color} ${sizeStyles[size].score}`} style={{ fontWeight: 600 }}>
        {score > 0 ? score.toFixed(0) : '--'}
      </span>
    </div>
  );
}
