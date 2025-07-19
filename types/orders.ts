export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: string;
  notes?: string;
  selected_option_value_ids: string[];
}

export interface OrderStatus {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  client_id: number;
  restaurant_id: number;
  deliverer_id: number | null;
  status_id: number;
  description?: string;
  subtotal: string;
  delivery_costs: string;
  service_charge: string;
  global_discount: string;
  street_number: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  long: string;
  lat: string;
  created_at: string;
  updated_at: string;
  orderItems: OrderItem[];
  status: OrderStatus;
}

export interface OrdersResponse {
  statusCode: number;
  message: string;
  data: {
    orders: Order[];
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

export interface OrdersListResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
