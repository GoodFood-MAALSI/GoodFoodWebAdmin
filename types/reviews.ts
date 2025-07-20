export interface Review {
  id: number;
  review: string;
  rating: number;
  status: 'active' | 'suspended';
  restaurantId: number;
  clientId: number;
  createdAt: string;
  updatedAt: string;
  restaurant?: {
    id: number;
    name: string;
    address?: string;
  };
  client?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
export interface ReviewsResponse {
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface ReviewFilters {
  rating?: number;
  status?: 'active' | 'suspended';
  page?: number;
  limit?: number;
  restaurantId?: number;
  clientId?: number;
}
export interface CreateReviewRequest {
  review: string;
  rating: number;
  restaurantId: number;
  clientId: number;
}
