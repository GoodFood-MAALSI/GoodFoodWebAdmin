"use client";
import { useState, useEffect } from "react";
import UniversalListing, {
  ListingConfig,
  ListingAction,
  ListingColumn,
  ListingStats,
  ListingFilter
} from "@/components/UniversalListing";
import { Badge } from "@/components/Ui/shadcn/badge";
import {
  ShoppingCart,
  Package,
  X,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Clock
} from "lucide-react";
import { colors } from "@/app/constants";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: string;
  notes?: string;
  selected_option_value_ids: string[];
}

interface OrderStatus {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Order {
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
  orderItems?: OrderItem[];
  status: OrderStatus;
}

interface OrdersResponse {
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<Record<string, unknown>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `${numericPrice.toFixed(2)}€`;
  };

  const getTotalPrice = (order: Order): number => {
    const subtotal = parseFloat(order.subtotal);
    const deliveryCosts = parseFloat(order.delivery_costs);
    const serviceCharge = parseFloat(order.service_charge);
    const globalDiscount = parseFloat(order.global_discount);
    
    return subtotal + deliveryCosts + serviceCharge - globalDiscount;
  };

  const getOrderStats = () => {
    if (!orders || !Array.isArray(orders)) {
      return {
        totalItems: 0,
        additionalStats: [
          { label: "En attente", value: 0, icon: Clock },
          { label: "En livraison", value: 0, icon: Truck },
          { label: "Chiffre d'affaires", value: "0.00€", icon: CreditCard }
        ]
      };
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status?.name === "En attente de l'acceptation du restaurant").length;
    const inDeliveryOrders = orders.filter(order => order.status?.name === "En livraison").length;
    const totalRevenue = orders.reduce((sum, order) => sum + getTotalPrice(order), 0);

    return {
      totalItems: totalOrders,
      additionalStats: [
        { label: "En attente", value: pendingOrders, icon: Clock },
        { label: "En livraison", value: inDeliveryOrders, icon: Truck },
        { label: "Chiffre d'affaires", value: `${totalRevenue.toFixed(2)}€`, icon: CreditCard }
      ]
    };
  };

  const loadOrders = async (page = currentPage, filters = currentFilters, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      
      if (filters && filters.status_id) params.append('status_id', String(filters.status_id));

      const response = await fetch(`/api/proxy/orders?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des commandes");
      }

      const data: OrdersResponse = await response.json();
      let ordersData: Order[] = [];
      let total = 0;

      if (data.data && Array.isArray(data.data)) {
        ordersData = data.data;
        total = data.pagination?.total || data.data.length;
      } else if (Array.isArray(data)) {
        ordersData = data;
        total = data.length;
      }

      if (search && search.trim()) {
        ordersData = ordersData.filter(order =>
          order.id.toString().includes(search) ||
          order.client_id.toString().includes(search) ||
          order.restaurant_id.toString().includes(search) ||
          order.status.name.toLowerCase().includes(search.toLowerCase()) ||
          (order.description && order.description.toLowerCase().includes(search.toLowerCase())) ||
          order.city.toLowerCase().includes(search.toLowerCase()) ||
          order.street.toLowerCase().includes(search.toLowerCase())
        );
      }

      setOrders(ordersData);
      setTotalCount(total);
      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (order: Order) => {
    try {
      const response = await fetch(`/api/proxy/orders/${order.id}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'annulation de la commande");
      }
      
      toast.success("Commande annulée avec succès");
      await loadOrders();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de l'annulation de la commande");
      throw error;
    }
  };

  const getStatusColor = (statusName: string) => {
    const normalizedStatus = statusName.toLowerCase().trim();
    
    switch (normalizedStatus) {
      case "en attente de l'acceptation du restaurant":
      case 'en attente de l\'acceptation du restaurant':
        return colors.lime[200];
      case 'acceptée par le restaurant':
      case 'acceptée':
        return colors.primary;
      case 'en cours de préparation':
      case 'en préparation':
        return colors.teal[500];
      case 'prête pour la livraison':
      case 'prête':
        return colors.accent;
      case 'en cours de livraison':
      case 'en livraison':
        return colors.teal[600];
      case 'livrée':
      case 'livré':
        return colors.success;
      case 'annulée':
        return colors.dark;
      case 'refusée':
        return colors.teal[800];
      case 'en attente de prise en charge par un livreur':
        return colors.lime[300];
      default:
        return colors.lime[400];
    }
  };

  const columns: ListingColumn[] = [
    {
      key: "id",
      label: "N° Commande",
      sortable: true,
      width: "120px",
      renderCell: (value: unknown) => (
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-medium">#{String(value)}</span>
        </div>
      )
    },
    {
      key: "client_id",
      label: "Client",
      sortable: false,
      renderCell: (value: unknown) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Client #{String(value)}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      filterable: true,
      width: "200px",
      renderCell: (_: unknown, item: unknown) => {
        const order = item as Order;
        return (
          <Badge
            className="text-white font-medium text-xs"
            style={{
              backgroundColor: getStatusColor(order.status.name)
            }}
          >
            {order.status.name}
          </Badge>
        );
      }
    },
    {
      key: "subtotal",
      label: "Total",
      sortable: true,
      width: "120px",
      renderCell: (_: unknown, item: unknown) => {
        const order = item as Order;
        return (
          <div className="text-right">
            <div className="font-medium">{formatPrice(getTotalPrice(order))}</div>
            <div className="text-xs text-gray-500">
              Items: {formatPrice(order.subtotal)}
            </div>
          </div>
        );
      }
    },
    {
      key: "orderItems",
      label: "Articles",
      sortable: false,
      width: "150px",
      renderCell: (_: unknown, item: unknown) => {
        const order = item as Order;
        const totalItems = (order.orderItems || []).reduce((sum, item) => sum + item.quantity, 0);
        return (
          <div className="text-sm">
            <div className="font-medium">{totalItems} article(s)</div>
            <div className="text-xs text-gray-500">
              {(order.orderItems || []).length} type(s)
            </div>
          </div>
        );
      }
    },
    {
      key: "address",
      label: "Adresse",
      sortable: false,
      renderCell: (_: unknown, item: unknown) => {
        const order = item as Order;
        return (
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="text-sm">
              <div>{order.street_number} {order.street}</div>
              <div className="text-xs text-gray-500">{order.city} {order.postal_code}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      width: "150px",
      renderCell: (value: unknown) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="text-sm">
            <div>{new Date(value as string).toLocaleDateString('fr-FR')}</div>
            <div className="text-xs text-gray-500">
              {new Date(value as string).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )
    }
  ];

  const actions: ListingAction[] = [
    {
      id: "cancel",
      label: "Annuler",
      icon: <X className="w-4 h-4" />,
      variant: "destructive",
      isVisible: (item: unknown) => {
        const order = item as Order;
        const statusName = order.status.name.toLowerCase().trim();
        return statusName === "en attente de l'acceptation du restaurant" ||
               statusName === "en attente de prise en charge par un livreur" ||
               statusName === "acceptée par le restaurant" ||
               statusName === "acceptée";
      },
      requiresConfirmation: true,
      confirmationMessage: "Êtes-vous sûr de vouloir annuler cette commande ?",
      onClick: (item: unknown) => cancelOrder(item as Order)
    }
  ];

  const filters: ListingFilter[] = [
    {
      key: "status_id",
      label: "Statut",
      type: "select",
      options: [
        { value: "1", label: "En attente" },
        { value: "2", label: "Acceptée" },
        { value: "3", label: "En préparation" },
        { value: "4", label: "Prête" },
        { value: "5", label: "En livraison" },
        { value: "6", label: "Livrée" },
        { value: "7", label: "Annulée" }
      ]
    }
  ];

  const stats: ListingStats[] = [
    {
      label: "Total Commandes",
      value: orders?.length || 0,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: colors.primary
    },
    {
      label: "En Attente",
      value: orders?.filter(o => o.status?.name === "En attente de l'acceptation du restaurant").length || 0,
      icon: <Clock className="w-6 h-6" />,
      color: colors.warning
    },
    {
      label: "En Livraison",
      value: orders?.filter(o => o.status?.name === "En livraison").length || 0,
      icon: <Truck className="w-6 h-6" />,
      color: colors.info
    },
    {
      label: "Chiffre d'Affaires",
      value: orders && orders.length > 0
        ? `${orders.reduce((sum, o) => sum + getTotalPrice(o), 0).toFixed(2)} €`
        : "0 €",
      icon: <CreditCard className="w-6 h-6" />,
      color: colors.success
    }
  ];

  const config: ListingConfig = {
    title: "Gestion des Commandes",
    description: "Gérez et suivez toutes les commandes de la plateforme",
    icon: <ShoppingCart className="w-6 h-6" />,
    stats,
    columns,
    actions,
    filters,
    searchable: true,
    searchPlaceholder: "Rechercher par N° commande, client, statut, adresse...",
    pagination: {
      enabled: true,
      pageSize: 10,
    },
    viewModes: ["list", "card"],
    refreshable: true,
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadOrders(1, currentFilters, query);
  };

  const handleFilter = (filters: Record<string, unknown>) => {
    setCurrentFilters(filters);
    loadOrders(1, filters, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadOrders(page, currentFilters, searchQuery);
  };

  const handleRefresh = () => {
    loadOrders(currentPage, currentFilters, searchQuery);
  };

  const renderCardItem = (item: unknown, _index: number) => {
    const order = item as Order;
    return (
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="font-bold text-lg">#{order.id}</span>
              </div>
              <Badge
                className="text-white font-medium"
                style={{
                  backgroundColor: getStatusColor(order.status.name)
                }}
              >
                {order.status.name}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Client #{order.client_id}</span>
              </div>
              
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <div>{order.street_number} {order.street}</div>
                  <div className="text-gray-500">{order.city} {order.postal_code}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="font-medium">{formatPrice(getTotalPrice(order))}</span>
                  <span className="text-gray-500 ml-2">
                    ({(order.orderItems || []).reduce((sum, item) => sum + item.quantity, 0)} articles)
                  </span>
                </div>
              </div>
              
              {order.description && (
                <div className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
                  "{order.description}"
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <div>
                <span>Créé le {new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                <span className="ml-2">à {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <UniversalListing
      config={config}
      data={orders}
      loading={loading}
      error={error}
      onRefresh={handleRefresh}
      onSearch={handleSearch}
      onFilter={handleFilter}
      onPageChange={handlePageChange}
      totalCount={totalCount}
      currentPage={currentPage}
      renderCardItem={renderCardItem}
    />
  );
}
