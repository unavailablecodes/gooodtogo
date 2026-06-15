// Notification types for the app

export type NotificationType =
  | 'neighbor_verification'
  | 'new_review'
  | 'new_checkin'
  | 'review_approved'
  | 'review_flagged'
  | 'pet_scan';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  pet_id?: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// Notification messages for each type
export const NOTIFICATION_MESSAGES: Record<NotificationType, (data: Record<string, unknown>) => { title: string; message: string }> = {
  neighbor_verification: (data) => ({
    title: 'New Neighbor Verification',
    message: `${data.verifier_name || 'A neighbor'} verified ${data.pet_name || 'your pet'}.`,
  }),
  new_review: (data) => ({
    title: 'New Review',
    message: `${data.reviewer_name || 'Someone'} left a review for ${data.pet_name || 'your pet'}.`,
  }),
  new_checkin: (data) => ({
    title: 'Business Check-in',
    message: `${data.business_name || 'A business'} checked in ${data.pet_name || 'your pet'}.`,
  }),
  review_approved: (data) => ({
    title: 'Review Approved',
    message: `Your review for ${data.pet_name || 'a pet'} has been approved.`,
  }),
  review_flagged: (data) => ({
    title: 'Review Flagged',
    message: `A review for ${data.pet_name || 'a pet'} has been flagged for review.`,
  }),
  pet_scan: (data) => ({
    title: 'Profile Viewed',
    message: `${data.pet_name || 'Your pet'}'s profile was scanned.`,
  }),
};
