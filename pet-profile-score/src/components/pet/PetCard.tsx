'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ScoreDisplay } from '@/components/ui/ScoreDisplay';
import { formatAge, getSpeciesEmoji } from '@/lib/utils/format';
import type { Pet } from '@/types/database';

interface PetCardProps {
  pet: Pet;
  showOwner?: boolean;
}

export function PetCard({ pet, showOwner = false }: PetCardProps) {
  const primaryPhoto = pet.pet_photos?.find(p => p.is_primary) || pet.pet_photos?.[0];

  return (
    <Link href={`/pets/${pet.id}`}>
      <Card hover className="h-full">
        {/* Photo */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {getSpeciesEmoji(pet.species)}
            </div>
          )}
          {pet.is_verified && (
            <Badge variant="success" className="absolute top-2 right-2">
              ✓ Verified
            </Badge>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{pet.name}</h3>
              <p className="text-sm text-gray-500">
                {pet.breed || pet.species} {pet.age_months && `• ${formatAge(pet.age_months)}`}
              </p>
            </div>
            {pet.overall_score > 0 && (
              <ScoreDisplay score={pet.overall_score} size="sm" showLabel={false} />
            )}
          </div>

          {pet.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pet.bio}</p>
          )}

          {/* Owner */}
          {showOwner && pet.owner && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <Avatar src={pet.owner.avatar_url} name={pet.owner.full_name} size="sm" />
              <span className="text-sm text-gray-600">{pet.owner.full_name}</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>{pet.total_reviews || 0} reviews</span>
            <span className="font-mono text-xs">{pet.public_id}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
