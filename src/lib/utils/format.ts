// Date formatting
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return formatDate(d);
}

// Alias for formatRelativeTime (used in NeighborVerificationList)
export function formatDistanceToNow(date: string | Date): string {
  return formatRelativeTime(date);
}

// Age formatting
export function formatAge(months: number | null | undefined): string {
  if (months === null || months === undefined) return 'Unknown';

  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

// Number formatting
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// Score formatting
export function formatScore(score: number, decimals: number = 1): string {
  return score.toFixed(decimals);
}

// Text formatting
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function snakeToTitle(text: string): string {
  return text
    .split('_')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

// Species emoji
export function getSpeciesEmoji(species: string): string {
  const emojis: Record<string, string> = {
    dog: '🐕',
    cat: '🐱',
    bird: '🐦',
    rabbit: '🐰',
    other: '🐾',
  };
  return emojis[species] || '🐾';
}

// Size abbreviation
export function getSizeAbbreviation(size: string): string {
  const abbrevs: Record<string, string> = {
    small: 'S',
    medium: 'M',
    large: 'L',
    xlarge: 'XL',
  };
  return abbrevs[size] || size;
}

// Vaccination status color
export function getVaccinationColor(status: string): string {
  const colors: Record<string, string> = {
    up_to_date: 'text-emerald-600 bg-emerald-50',
    partial: 'text-yellow-600 bg-yellow-50',
    overdue: 'text-red-600 bg-red-50',
    unknown: 'text-gray-600 bg-gray-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
}

// Generate initials from name
export function getInitials(name: string | null): string {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}