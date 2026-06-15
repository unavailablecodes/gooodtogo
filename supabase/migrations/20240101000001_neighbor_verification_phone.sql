-- Migration: Add phone field to neighbor_verifications and unique constraint
-- Date: 2024-01-01

-- 1. Add verifier_phone and notes columns to neighbor_verifications table
ALTER TABLE neighbor_verifications
ADD COLUMN IF NOT EXISTS verifier_phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS verifier_id UUID; -- Make nullable for anonymous verifications

-- 2. Add unique constraint to prevent duplicate verifications per phone per pet
-- This ensures one phone can only verify one pet once
CREATE UNIQUE INDEX IF NOT EXISTS unique_phone_per_pet
ON neighbor_verifications(pet_id, verifier_phone)
WHERE verifier_phone IS NOT NULL;

-- 3. Make verifier_id optional (remove NOT NULL if it exists)
ALTER TABLE neighbor_verifications
ALTER COLUMN verifier_id DROP NOT NULL;

-- 4. Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_neighbor_verifications_phone
ON neighbor_verifications(verifier_phone);

CREATE INDEX IF NOT EXISTS idx_neighbor_verifications_created
ON neighbor_verifications(created_at DESC);
