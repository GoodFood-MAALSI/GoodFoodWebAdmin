export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  status: "active" | "suspended" | "inactive";
  created_at: string;
  updated_at?: string;
  role?: string;
  __entity: string;
}

export interface UsersResponse {
  statusCode: number;
  message: string;
  data: {
    users: User[];
    links: {
      self: string;
      first: string;
      last: string;
    };
    meta: {
      totalItems: number;
      currentPage: number;
      totalPages: number;
      itemsPerPage: number;
    };
  };
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    refreshToken: string;
    token: string;
    tokenExpires: number;
    user: {
      id: number;
      email: string;
      status: string;
      first_name: string;
      last_name: string;
      created_at: string;
      updated_at: string;
      force_password_change: boolean;
      role: string;
      __entity: "User";
    };
    force_password_change: boolean;
  };
}

export interface RestaurantType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantImage {
  id: number;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  isMain: boolean;
  restaurant_id: number;
  menu_item_id: number | null;
  entityType: string;
  created_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  street_number: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  email: string;
  phone_number: string;
  siret: string;
  is_open: boolean;
  status: "active" | "suspended" | "inactive";
  long: string;
  lat: string;
  restaurantTypeId: number;
  userId: number;
  created_at: string;
  updated_at: string;
  restaurantType: RestaurantType;
  images: RestaurantImage[];
  review_count: number;
  average_rating: number;
}

export interface RestaurantsResponse {
  statusCode: number;
  message: string;
  data: {
    restaurants: Restaurant[];
    links: {
      self: string;
      first: string;
      last: string;
    };
    meta: {
      totalItems: number;
      currentPage: number;
      totalPages: number;
      itemsPerPage: number;
    };
  };
}
