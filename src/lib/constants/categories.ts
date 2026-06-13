import { ReviewerType, Species, Size, Gender, VaccinationStatus, ProfileVisibility, BusinessType, AccessDecision } from '@/types/database';

export const SPECIES_OPTIONS: { value: Species; label: string }[] = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'other', label: 'Other' },
];

// Dog breeds including Indian breeds and street dogs
export const DOG_BREEDS = [
  // Indian Breeds
  { value: 'indian_pariah', label: 'Indian Pariah Dog' },
  { value: 'mudhol_hound', label: 'Mudhol Hound' },
  { value: 'caravan_hound', label: 'Caravan Hound' },
  { value: ' Gaddi_Kutta', label: 'Gaddi Kutta' },
  { value: 'himachali_hound', label: 'Himachali Hound' },
  { value: 'rajapalayam', label: 'Rajapalayam' },
  { value: 'chippiparai', label: 'Chippiparai' },
  { value: 'kombai', label: 'Kombai' },
  { value: 'taigan', label: 'Taigan' },
  { value: 'jonangi', label: 'Jonangi' },
  { value: 'segugio_inano', label: 'Segugio Dell\'Appennino' },
  // Street/Stray
  { value: 'street_indian', label: 'Indian Street Dog' },
  { value: 'street_mixed', label: 'Mixed Breed / Street Dog' },
  // Popular Global Breeds
  { value: 'labrador_retriever', label: 'Labrador Retriever' },
  { value: 'golden_retriever', label: 'Golden Retriever' },
  { value: 'german_shepherd', label: 'German Shepherd' },
  { value: 'golden_shepherd', label: 'Golden Shepherd' },
  { value: 'poodle', label: 'Poodle' },
  { value: 'bulldog', label: 'Bulldog' },
  { value: 'beagle', label: 'Beagle' },
  { value: 'rottweiler', label: 'Rottweiler' },
  { value: 'dachshund', label: 'Dachshund' },
  { value: 'pomeranian', label: 'Pomeranian' },
  { value: 'shih_tzu', label: 'Shih Tzu' },
  { value: 'yorkshire_terrier', label: 'Yorkshire Terrier' },
  { value: 'boxer', label: 'Boxer' },
  { value: 'doberman', label: 'Doberman' },
  { value: 'great_dane', label: 'Great Dane' },
  { value: 'siberian_husky', label: 'Siberian Husky' },
  { value: 'pit_bull', label: 'Pit Bull' },
  { value: 'cocker_spaniel', label: 'Cocker Spaniel' },
  { value: 'maltese', label: 'Maltese' },
  { value: 'shar_pei', label: 'Shar Pei' },
  { value: 'chow_chow', label: 'Chow Chow' },
  { value: 'akita', label: 'Akita' },
  { value: 'shiba_inu', label: 'Shiba Inu' },
  { value: 'pug', label: 'Pug' },
  { value: 'lhasa_apso', label: 'Lhasa Apso' },
  { value: 'dalmatian', label: 'Dalmatian' },
  { value: 'weimaraner', label: 'Weimaraner' },
  { value: 'border_collie', label: 'Border Collie' },
  { value: 'australian_shepherd', label: 'Australian Shepherd' },
  { value: 'cavalier_king_charles', label: 'Cavalier King Charles' },
  { value: 'schnauzer', label: 'Schnauzer' },
  { value: 'mastiff', label: 'Mastiff' },
  { value: 'bernese_mountain', label: 'Bernese Mountain Dog' },
  { value: 'newfoundland', label: 'Newfoundland' },
  { value: 'samoyed', label: 'Samoyed' },
  { value: 'st_bernard', label: 'St. Bernard' },
  { value: 'bloodhound', label: 'Bloodhound' },
  { value: ' setter', label: 'Irish Setter' },
  { value: 'pointer', label: 'German Pointer' },
  { value: 'vizsla', label: 'Vizsla' },
  { value: ' Rhodesian_ridgeback', label: 'Rhodesian Ridgeback' },
  { value: 'jack_russell', label: 'Jack Russell Terrier' },
  { value: 'west_highland', label: 'West Highland White Terrier' },
  { value: 'scottish_terrier', label: 'Scottish Terrier' },
  { value: 'airedale', label: 'Airedale Terrier' },
  { value: 'bedlington', label: 'Bedlington Terrier' },
  { value: 'kerry_blue', label: 'Kerry Blue Terrier' },
];

// Cat breeds
export const CAT_BREEDS = [
  { value: 'indian_street', label: 'Indian Street Cat' },
  { value: 'persian', label: 'Persian' },
  { value: 'maine_coon', label: 'Maine Coon' },
  { value: 'ragdoll', label: 'Ragdoll' },
  { value: 'british_shorthair', label: 'British Shorthair' },
  { value: 'siamese', label: 'Siamese' },
  { value: 'bengal', label: 'Bengal' },
  { value: 'abyssinian', label: 'Abyssinian' },
  { value: 'sphynx', label: 'Sphynx' },
  { value: 'scottish_fold', label: 'Scottish Fold' },
  { value: 'russian_blue', label: 'Russian Blue' },
  { value: 'himalayan', label: 'Himalayan' },
  { value: 'birman', label: 'Birman' },
  { value: 'tonkinese', label: 'Tonkinese' },
  { value: 'burmese', label: 'Burmese' },
  { value: 'bombay', label: 'Bombay' },
  { value: 'exotic_shorthair', label: 'Exotic Shorthair' },
  { value: 'norwegian_forest', label: 'Norwegian Forest Cat' },
  { value: 'turkish_angora', label: 'Turkish Angora' },
  { value: 'selkirk_rex', label: 'Selkirk Rex' },
];

// Certificate types
export const CERTIFICATE_TYPES = [
  { value: 'kci', label: 'KCI (Kennel Club of India)' },
  { value: 'akc', label: 'AKC (American Kennel Club)' },
  { value: 'ukc', label: 'UKC (United Kennel Club)' },
  { value: 'fci', label: 'FCI (Fédération Cynologique Internationale)' },
  { value: 'icc', label: 'ICC (Indian Canine Club)' },
  { value: 'lineage', label: 'Pedigree / Lineage Certificate' },
  { value: 'vaccination', label: 'Vaccination Certificate' },
  { value: 'health', label: 'Health Certificate' },
  { value: 'microchip', label: 'Microchip Certificate' },
  { value: 'other', label: 'Other Certificate' },
];

export const SIZE_OPTIONS: { value: Size; label: string }[] = [
  { value: 'small', label: 'Small (under 10 kg)' },
  { value: 'medium', label: 'Medium (10-25 kg)' },
  { value: 'large', label: 'Large (25-40 kg)' },
  { value: 'xlarge', label: 'Extra Large (40+ kg)' },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Not Sure' },
];

export const VACCINATION_OPTIONS: { value: VaccinationStatus; label: string }[] = [
  { value: 'up_to_date', label: 'Up to Date' },
  { value: 'partial', label: 'Partial' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'unknown', label: 'Unknown' },
];

export const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Anyone can view this profile' },
  { value: 'limited', label: 'Limited', description: 'Only verified users can view' },
  { value: 'hidden', label: 'Hidden', description: 'Only you can view' },
];

export const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'airline', label: 'Airline' },
  { value: 'housing_society', label: 'Housing Society' },
  { value: 'pet_store', label: 'Pet Store' },
  { value: 'vet', label: 'Veterinary Clinic' },
  { value: 'grooming', label: 'Grooming Salon' },
  { value: 'pet_daycare', label: 'Pet Daycare' },
  { value: 'trainer', label: 'Pet Trainer' },
  { value: 'shelter', label: 'Animal Shelter' },
  { value: 'other', label: 'Other' },
];

export const ACCESS_DECISION_OPTIONS: { value: AccessDecision; label: string; description: string }[] = [
  { value: 'allowed', label: 'Auto Allow', description: 'Pets with good scores are automatically allowed' },
  { value: 'requires_approval', label: 'Review Needed', description: 'All pets require manual approval' },
  { value: 'denied', label: 'No Pets', description: 'No pets allowed' },
];

export const REVIEWER_TYPE_OPTIONS: { value: ReviewerType; label: string }[] = [
  { value: 'neighbor', label: 'Neighbor' },
  { value: 'pet_parent', label: 'Pet Parent' },
  { value: 'restaurant', label: 'Restaurant Staff' },
  { value: 'cafe', label: 'Café Staff' },
  { value: 'hotel', label: 'Hotel Staff' },
  { value: 'airline', label: 'Airline Staff' },
  { value: 'housing_society', label: 'Housing Society' },
  { value: 'vet', label: 'Veterinarian' },
  { value: 'trainer', label: 'Pet Trainer' },
  { value: 'groomer', label: 'Groomer' },
  { value: 'admin', label: 'Admin' },
];

export const SCORING_CATEGORIES = [
  {
    key: 'friendliness_humans',
    label: 'With Humans',
    description: 'How friendly was the pet?',
    icon: '👋',
    weight: 1.5,
    inverted: false,
  },
  {
    key: 'friendliness_pets',
    label: 'With Other Pets',
    description: 'How did they interact with other animals?',
    icon: '🐾',
    weight: 1.3,
    inverted: false,
  },
  {
    key: 'barking_issues',
    label: 'Barking',
    description: 'How quiet was the pet?',
    icon: '🔇',
    weight: 1.2,
    inverted: true,
  },
  {
    key: 'aggression_issues',
    label: 'Aggression',
    description: 'Any signs of aggression?',
    icon: '⚠️',
    weight: 1.5,
    inverted: true,
  },
  {
    key: 'public_behavior',
    label: 'Public Manners',
    description: 'Behavior in public spaces?',
    icon: '🏙️',
    weight: 1.0,
    inverted: false,
  },
  {
    key: 'restaurant_behavior',
    label: 'Indoor Manners',
    description: 'Behavior in cafes/restaurants?',
    icon: '☕',
    weight: 1.3,
    inverted: false,
  },
  {
    key: 'travel_behavior',
    label: 'Travel Friendly',
    description: 'How well did they handle travel?',
    icon: '✈️',
    weight: 1.2,
    inverted: false,
  },
  {
    key: 'cleanliness',
    label: 'Cleanliness',
    description: 'Was the pet clean and well-groomed?',
    icon: '🧼',
    weight: 1.0,
    inverted: false,
  },
  {
    key: 'leash_discipline',
    label: 'Leash Skills',
    description: 'Response to leash commands?',
    icon: '🦮',
    weight: 0.8,
    inverted: false,
  },
] as const;

export type ScoringCategoryKey = typeof SCORING_CATEGORIES[number]['key'];

export const SITE_NAME = 'Pet Profile';
export const SITE_DESCRIPTION = 'A trusted profile for your pet\'s behavior';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
