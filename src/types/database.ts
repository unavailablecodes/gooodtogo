export type UserRole = 'user' | 'business' | 'admin';
export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
export type Gender = 'male' | 'female' | 'unknown';
export type Size = 'small' | 'medium' | 'large' | 'xlarge';
export type VaccinationStatus = 'up_to_date' | 'partial' | 'overdue' | 'unknown';
export type ProfileVisibility = 'public' | 'limited' | 'hidden';
export type BusinessType = 'restaurant' | 'cafe' | 'hotel' | 'airline' | 'housing_society' | 'pet_store' | 'vet' | 'grooming' | 'pet_daycare' | 'trainer' | 'shelter' | 'other';
export type AccessDecision = 'allowed' | 'denied' | 'requires_approval';
export type ReviewerType = 'neighbor' | 'pet_parent' | 'restaurant' | 'cafe' | 'hotel' | 'airline' | 'housing_society' | 'vet' | 'trainer' | 'groomer' | 'admin';
export type DisputeStatus = 'pending' | 'under_review' | 'resolved' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  phone: string | null;
  phone_verified: boolean;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  is_profile_public: boolean;
  show_contact_details: boolean;
  allow_detailed_history: boolean;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: Species;
  breed: string | null;
  age_months: number | null;
  gender: Gender | null;
  size: Size | null;
  vaccination_status: VaccinationStatus;
  vaccination_notes: string | null;
  bio: string | null;
  special_needs: string | null;
  qr_code_url: string | null;
  public_id: string;
  overall_score: number;
  total_reviews: number;
  profile_visibility: ProfileVisibility;
  is_verified: boolean;
  has_kci_certificate: boolean;
  is_active: boolean;
  delete_requested?: boolean;
  delete_requested_at?: string | null;
  delete_approved?: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: Profile;
  pet_photos?: PetPhoto[];
}

export interface PetPhoto {
  id: string;
  pet_id: string;
  storage_path: string;
  url: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
}

export interface BusinessCheckin {
  id: string;
  pet_id: string;
  business_id: string | null;
  business_name: string | null;
  visit_date: string;
  overall_rating: number | null;
  was_aggressive: boolean;
  was_noisy: boolean;
  was_friendly: boolean;
  cleaned_up_after: boolean;
  would_allow_again: boolean;
  notes: string | null;
  verified: boolean;
  created_at: string;
}

export interface NeighborVerification {
  id: string;
  pet_id: string;
  verifier_id: string | null;
  verifier_name: string | null;
  verifier_phone: string | null;
  interaction_type: 'walked_together' | 'met_at_park' | 'visited_home' | 'saw_daily' | 'other';
  interaction_count: number;
  friendly_rating: number | null;
  quiet_rating: number | null;
  well_behaved: boolean;
  notes: string | null;
  created_at: string;
}

export interface BehavioralAssessment {
  id: string;
  pet_id: string;
  assessor_id: string | null;
  assessor_type: 'vet' | 'trainer' | 'groomer' | 'daycare' | 'walker' | 'neighbor';
  assessor_name: string | null;
  assessment_date: string | null;
  score: number | null;
  leash_control: number | null;
  obedience_level: number | null;
  social_skills: number | null;
  anxiety_level: number | null;
  notes: string | null;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  business_name: string;
  business_type: BusinessType;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  default_access_policy: AccessDecision;
  is_verified: boolean;
  is_active: boolean;
  pet_friendly_score: number;
  total_business_reviews: number;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface Review {
  id: string;
  pet_id: string;
  reviewer_id: string;
  business_id: string | null;
  friendliness_humans: number;
  friendliness_pets: number;
  barking_issues: number;
  aggression_issues: number;
  public_behavior: number;
  restaurant_behavior: number;
  travel_behavior: number;
  cleanliness: number;
  leash_discipline: number;
  overall_score: number;
  review_text: string | null;
  photo_urls: string[] | null;
  reviewer_type: ReviewerType;
  visit_date: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  is_verified_visit: boolean;
  verification_token: string | null;
  is_approved: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  flagged_by: string | null;
  flagged_at: string | null;
  reviewer_credibility_score: number;
  created_at: string;
  updated_at: string;
  // Joined data
  pet?: Pet;
  reviewer?: Profile;
  business?: Business;
}

export interface ReviewDispute {
  id: string;
  review_id: string;
  pet_owner_id: string;
  dispute_reason: string;
  dispute_details: string | null;
  evidence_photos: string[] | null;
  status: DisputeStatus;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  review?: Review;
}

export interface PetVisit {
  id: string;
  pet_id: string;
  business_id: string;
  visit_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  access_decision: AccessDecision;
  notes: string | null;
  created_at: string;
  pet?: Pet;
  business?: Business;
}

export interface BusinessVisit {
  id: string;
  pet_id: string;
  business_id: string;
  visit_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  business_rated: boolean;
  pet_rated: boolean;
  created_at: string;
  pet?: Pet;
  business?: Business;
}

export interface BusinessReview {
  id: string;
  visit_id: string;
  business_id: string;
  reviewer_id: string;
  welcome_rating: number | null;
  facilities_rating: number | null;
  cleanliness_rating: number | null;
  pet_safety_rating: number | null;
  staff_friendliness: number | null;
  overall_rating: number | null;
  would_recommend: boolean | null;
  would_visit_again: boolean | null;
  review_text: string | null;
  created_at: string;
  business?: Business;
  reviewer?: Profile;
}

export interface UserCredibility {
  user_id: string;
  total_reviews: number;
  helpful_votes: number;
  false_report_count: number;
  account_age_days: number;
  credibility_score: number;
  is_verified_reviewer: boolean;
  is_trusted_neighbor: boolean;
  updated_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string | null;
  action_type: string;
  target_type: 'user' | 'pet' | 'review' | 'business';
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface ReviewVote {
  id: string;
  review_id: string;
  voter_id: string;
  vote_type: 'helpful' | 'not_helpful';
  created_at: string;
}

// Form types
export interface CreatePetForm {
  name: string;
  species: Species;
  breed?: string;
  age_months?: number;
  gender?: Gender;
  size?: Size;
  vaccination_status?: VaccinationStatus;
  vaccination_notes?: string;
  bio?: string;
  special_needs?: string;
  profile_visibility?: ProfileVisibility;
}

export interface CreateReviewForm {
  pet_id: string;
  friendliness_humans: number;
  friendliness_pets: number;
  barking_issues: number;
  aggression_issues: number;
  public_behavior: number;
  restaurant_behavior: number;
  travel_behavior: number;
  cleanliness: number;
  leash_discipline: number;
  review_text?: string;
  reviewer_type: ReviewerType;
  visit_date?: string;
  location_name?: string;
  photo_urls?: string[];
}

export interface CreateBusinessForm {
  business_name: string;
  business_type: BusinessType;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  default_access_policy?: AccessDecision;
}

// Score types
export interface CategoryScore {
  category: string;
  score: number;
  percentage: number;
  totalReviews: number;
}

export interface PetScore {
  overallScore: number;
  totalReviews: number;
  scoreBreakdown: CategoryScore[];
}

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      pets: {
        Row: Pet;
        Insert: Omit<Pet, 'id' | 'created_at' | 'updated_at' | 'overall_score' | 'total_reviews' | 'qr_code_url'>;
        Update: Partial<Omit<Pet, 'id' | 'owner_id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'overall_score'>;
        Update: Partial<Omit<Review, 'id' | 'pet_id' | 'reviewer_id' | 'created_at'>>;
      };
    };
  };
};
