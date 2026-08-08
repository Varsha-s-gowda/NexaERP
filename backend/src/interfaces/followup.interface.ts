export interface CreateFollowUpRequest {
  customerId: string;
  notes: string;
  followUpDate?: string;
}

export interface UpdateFollowUpRequest {
  notes?: string;
  followUpDate?: string;
}

export interface FollowUpResponse {
  id: string;
  customerId: string;
  notes: string;
  followUpDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
