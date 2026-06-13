import { z } from 'zod';
import type { Species, Gender, Size, VaccinationStatus, ProfileVisibility, BusinessType, ReviewerType, AccessDecision } from '@/types/database';

// Pet schema
export const petSchema = z.object({
  name: z.string()
    .min(1, 'Pet name is required')
    .max(50, 'Pet name must be 50 characters or less'),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  breed: z.string().max(100, 'Breed must be 100 characters or less').optional().or(z.literal('')),
  age_months: z.number()
    .int('Age must be a whole number')
    .min(0, 'Age cannot be negative')
    .max(360, 'Age seems too high')
    .optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  size: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  vaccination_status: z.enum(['up_to_date', 'partial', 'overdue', 'unknown']).optional(),
  vaccination_notes: z.string().max(500).optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  special_needs: z.string().max(500).optional(),
  profile_visibility: z.enum(['public', 'limited', 'hidden']).default('public'),
});

// Review schema
export const reviewSchema = z.object({
  pet_id: z.string().uuid('Invalid pet ID'),
  friendliness_humans: z.number().int().min(1).max(5),
  friendliness_pets: z.number().int().min(1).max(5),
  barking_issues: z.number().int().min(1).max(5),
  aggression_issues: z.number().int().min(1).max(5),
  public_behavior: z.number().int().min(1).max(5),
  restaurant_behavior: z.number().int().min(1).max(5),
  travel_behavior: z.number().int().min(1).max(5),
  cleanliness: z.number().int().min(1).max(5),
  leash_discipline: z.number().int().min(1).max(5),
  review_text: z.string().max(1000).optional(),
  reviewer_type: z.enum(['neighbor', 'pet_owner', 'restaurant', 'cafe', 'hotel', 'airline', 'housing_society', 'admin']),
  visit_date: z.string().datetime().optional(),
  location_name: z.string().max(200).optional(),
  photo_urls: z.array(z.string().url()).max(5).optional(),
});

// Business schema
export const businessSchema = z.object({
  business_name: z.string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be 100 characters or less'),
  business_type: z.enum(['restaurant', 'cafe', 'hotel', 'airline', 'housing_society', 'pet_store', 'vet', 'other']),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  default_access_policy: z.enum(['allowed', 'denied', 'requires_approval']).default('requires_approval'),
});

// User profile schema
export const profileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional().or(z.literal('')),
  avatar_url: z.string().url().optional(),
  is_profile_public: z.boolean().default(true),
  show_contact_details: z.boolean().default(false),
  allow_detailed_history: z.boolean().default(false),
});

// Dispute schema
export const disputeSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  dispute_reason: z.enum(['inaccurate', 'false', 'spam', 'harassment', 'other']),
  dispute_details: z.string().max(1000).optional(),
  evidence_photos: z.array(z.string().url()).max(5).optional(),
});

// Flag review schema
export const flagReviewSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  flag_reason: z.enum(['spam', 'inappropriate', 'false', 'harassment', 'other']),
  additional_details: z.string().max(500).optional(),
});

// Type exports
export type PetFormData = z.infer<typeof petSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type BusinessFormData = z.infer<typeof businessSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type DisputeFormData = z.infer<typeof disputeSchema>;
export type FlagReviewFormData = z.infer<typeof flagReviewSchema>;

// Validation helper
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}

// File validation
export function validateImageFile(file: File, maxSizeMB: number = 5): {
  valid: boolean;
  error?: string;
} {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}` };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File too large. Maximum size: ${maxSizeMB}MB` };
  }

  return { valid: true };
}