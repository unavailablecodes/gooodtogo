-- Migration: Create notifications table for in-app notifications
-- Date: 2024-01-02

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_pet_id ON notifications(pet_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 3. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_pet_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, pet_id, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_pet_id, p_data)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger to notify pet owner on new neighbor verification
CREATE OR REPLACE FUNCTION notify_on_neighbor_verification()
RETURNS TRIGGER AS $$
DECLARE
  pet_owner_id UUID;
  pet_name TEXT;
BEGIN
  -- Get pet owner
  SELECT owner_id, name INTO pet_owner_id, pet_name
  FROM pets WHERE id = NEW.pet_id;

  -- Create notification for owner
  IF pet_owner_id IS NOT NULL THEN
    PERFORM create_notification(
      pet_owner_id,
      'neighbor_verification',
      'New Neighbor Verification',
      COALESCE(NEW.verifier_name, 'A neighbor') || ' verified ' || pet_name || '.',
      NEW.pet_id,
      jsonb_build_object(
        'verifier_name', NEW.verifier_name,
        'well_behaved', NEW.well_behaved,
        'interaction_type', NEW.interaction_type
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_neighbor_verification
  AFTER INSERT ON neighbor_verifications
  FOR EACH ROW EXECUTE FUNCTION notify_on_neighbor_verification();

-- 7. Trigger to notify pet owner on new business check-in
CREATE OR REPLACE FUNCTION notify_on_business_checkin()
RETURNS TRIGGER AS $$
DECLARE
  pet_owner_id UUID;
  pet_name TEXT;
BEGIN
  -- Get pet owner
  SELECT owner_id, name INTO pet_owner_id, pet_name
  FROM pets WHERE id = NEW.pet_id;

  -- Create notification for owner
  IF pet_owner_id IS NOT NULL THEN
    PERFORM create_notification(
      pet_owner_id,
      'new_checkin',
      'Business Check-in',
      pet_name || ' was checked in at ' || COALESCE(NEW.business_name, 'a business') || '.',
      NEW.pet_id,
      jsonb_build_object(
        'business_name', NEW.business_name,
        'overall_rating', NEW.overall_rating,
        'would_allow_again', NEW.would_allow_again
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_business_checkin
  AFTER INSERT ON business_checkins
  FOR EACH ROW EXECUTE FUNCTION notify_on_business_checkin();

-- 8. Trigger to notify pet owner on new review
CREATE OR REPLACE FUNCTION notify_on_new_review()
RETURNS TRIGGER AS $$
DECLARE
  pet_owner_id UUID;
  pet_name TEXT;
  reviewer_name TEXT;
BEGIN
  -- Get pet owner and reviewer
  SELECT p.owner_id, p.name INTO pet_owner_id, pet_name
  FROM pets p WHERE p.id = NEW.pet_id;

  -- Get reviewer name
  SELECT full_name INTO reviewer_name
  FROM profiles WHERE id = NEW.reviewer_id;

  -- Create notification for owner
  IF pet_owner_id IS NOT NULL AND pet_owner_id != NEW.reviewer_id THEN
    PERFORM create_notification(
      pet_owner_id,
      'new_review',
      'New Review',
      COALESCE(reviewer_name, 'Someone') || ' left a review for ' || pet_name || '.',
      NEW.pet_id,
      jsonb_build_object(
        'reviewer_name', reviewer_name,
        'overall_score', NEW.overall_score
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_review
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION notify_on_new_review();
