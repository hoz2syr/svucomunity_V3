export type ReviewCategory = 'ui' | 'content' | 'performance' | 'other';

export type ReviewStatus = 'pending' | 'reviewed' | 'responded';

export type Review = {
  id: string;
  user_id: string;
  rating: number;
  category: ReviewCategory;
  comment: string;
  status: ReviewStatus;
  admin_response: string | null;
  responded_by: string | null;
  responded_at: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
    username: string | null;
  } | null;
};

export type CreateReviewInput = {
  rating: number;
  category: ReviewCategory;
  comment: string;
};

export type RespondToReviewInput = {
  reviewId: string;
  response: string;
};

export type ReviewFilters = {
  status?: ReviewStatus;
  category?: ReviewCategory;
  search?: string;
};
