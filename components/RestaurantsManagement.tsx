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
  Store,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  Ban,
  RotateCcw,
  Image as ImageIcon,
  Users
} from "lucide-react";
import { colors } from "@/app/constants";
import { toast } from "sonner";

interface RestaurantType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface RestaurantImage {
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

interface Restaurant {
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

interface RestaurantsResponse {
  data: Restaurant[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function RestaurantsManagement() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<Record<string, unknown>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const loadRestaurants = async (page = currentPage, filters = currentFilters, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      
      if (filters && filters.status && filters.status !== "all") params.append('status', String(filters.status));
      if (filters && filters.is_open !== undefined && filters.is_open !== "all") params.append('is_open', String(filters.is_open));
      if (filters && filters.city) params.append('city', String(filters.city));
      if (filters && filters.restaurant_type) params.append('restaurant_type', String(filters.restaurant_type));
      
      if (search && search.trim()) {
        params.append('name', search);
      }

      const url = `/api/proxy/restaurants?${params.toString()}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des restaurants");
      }

      const data: RestaurantsResponse = await response.json();
      
      let restaurantsData: Restaurant[] = [];
      let total = 0;

      if (data.data && Array.isArray(data.data)) {
        restaurantsData = data.data;
        total = data.pagination?.total || data.data.length;
      } else if (Array.isArray(data)) {
        restaurantsData = data;
        total = data.length;
      }

      setRestaurants(restaurantsData);
      setTotalCount(total);
      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendRestaurant = async (restaurantId: number) => {
    try {
      const response = await fetch(`/api/proxy/restaurants/${restaurantId}/suspend`, {
        method: "PATCH",
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Erreur lors de la suspension du restaurant");
      }

      const result = await response.json();

      await loadRestaurants();
      toast.success("Restaurant suspendu avec succès");
    } catch (err) {
      toast.error("Impossible de suspendre le restaurant");
    }
  };

  const handleRestoreRestaurant = async (restaurantId: number) => {
    try {
      const response = await fetch(`/api/proxy/restaurants/${restaurantId}/restore`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Erreur lors de la réactivation du restaurant");
      }

      const result = await response.json();

      await loadRestaurants();
      toast.success("Restaurant réactivé avec succès");
    } catch (err) {
      toast.error("Impossible de réactiver le restaurant");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return colors.success;
      case 'suspended':
        return colors.warning;
      case 'inactive':
        return colors.dark;
      default:
        return colors.teal[600];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Actif';
      case 'suspended':
        return 'Suspendu';
      case 'inactive':
        return 'Inactif';
      default:
        return status;
    }
  };

  const columns: ListingColumn[] = [
    {
      key: "name",
      label: "Restaurant",
      sortable: true,
      renderCell: (_: unknown, item: unknown) => {
        const restaurant = item as Restaurant;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {restaurant.images && restaurant.images.length > 0 ? (
                <img
                  src={restaurant.images.find(img => img.isMain)?.path || restaurant.images[0].path}
                  alt={restaurant.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">{restaurant.name}</div>
              <div className="text-sm text-gray-500">{restaurant.restaurantType.name}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      renderCell: (_: unknown, item: unknown) => {
        const restaurant = item as Restaurant;
        return (
          <div className="flex flex-col space-y-1">
            <Badge
              style={{
                backgroundColor: getStatusColor(restaurant.status),
                color: "white"
              }}
            >
              {getStatusLabel(restaurant.status)}
            </Badge>
            {restaurant.is_open ? (
              <Badge style={{ backgroundColor: colors.success, color: "white" }}>
                Ouvert
              </Badge>
            ) : (
              <Badge style={{ backgroundColor: colors.dark, color: "white" }}>
                Fermé
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: "location",
      label: "Localisation",
      sortable: false,
      renderCell: (_: unknown, item: unknown) => {
        const restaurant = item as Restaurant;
        return (
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="text-sm">
              <div>{restaurant.street_number} {restaurant.street}</div>
              <div className="text-gray-500">{restaurant.city} {restaurant.postal_code}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: "contact",
      label: "Contact",
      sortable: false,
      renderCell: (_: unknown, item: unknown) => {
        const restaurant = item as Restaurant;
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{restaurant.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{restaurant.phone_number}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: "rating",
      label: "Évaluations",
      sortable: true,
      renderCell: (_: unknown, item: unknown) => {
        const restaurant = item as Restaurant;
        return (
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <div className="text-sm">
              <div className="font-medium">{restaurant.average_rating ? restaurant.average_rating.toFixed(1) : "N/A"}</div>
              <div className="text-gray-500">({restaurant.review_count} avis)</div>
            </div>
          </div>
        );
      }
    }
  ];

  const actions: ListingAction[] = [
    {
      id: "suspend",
      label: "Suspendre",
      icon: <Ban className="w-4 h-4" />,
      variant: "destructive",
      isVisible: (item: unknown) => {
        const restaurant = item as Restaurant;
        return restaurant.status === "active";
      },
      requiresConfirmation: true,
      confirmationMessage: "Êtes-vous sûr de vouloir suspendre ce restaurant ?",
      onClick: (item: unknown) => handleSuspendRestaurant((item as Restaurant).id)
    },
    {
      id: "restore",
      label: "Réactiver",
      icon: <RotateCcw className="w-4 h-4" />,
      variant: "default",
      isVisible: (item: unknown) => {
        const restaurant = item as Restaurant;
        return restaurant.status === "suspended";
      },
      requiresConfirmation: true,
      confirmationMessage: "Êtes-vous sûr de vouloir réactiver ce restaurant ?",
      onClick: (item: unknown) => handleRestoreRestaurant((item as Restaurant).id)
    }
  ];

  const filters: ListingFilter[] = [
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "all", label: "Tous les statuts" },
        { value: "active", label: "Actif" },
        { value: "suspended", label: "Suspendu" },
        { value: "inactive", label: "Inactif" }
      ]
    },
    {
      key: "is_open",
      label: "Ouverture",
      type: "select",
      options: [
        { value: "all", label: "Tous" },
        { value: "true", label: "Ouvert" },
        { value: "false", label: "Fermé" }
      ]
    }
  ];

  const renderCardView = (item: unknown, index: number) => {
    const restaurant = item as Restaurant;
    return (
      <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          {restaurant.images && restaurant.images.length > 0 ? (
            <img
              src={restaurant.images.find(img => img.isMain)?.path || restaurant.images[0].path}
              alt={restaurant.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium text-lg">{restaurant.name}</div>
            <div className="text-sm text-gray-500">{restaurant.restaurantType.name}</div>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <Badge
            style={{
              backgroundColor: getStatusColor(restaurant.status),
              color: "white"
            }}
          >
            {getStatusLabel(restaurant.status)}
          </Badge>
          {restaurant.is_open ? (
            <Badge style={{ backgroundColor: colors.success, color: "white" }}>
              Ouvert
            </Badge>
          ) : (
            <Badge style={{ backgroundColor: colors.dark, color: "white" }}>
              Fermé
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{restaurant.street_number} {restaurant.street}, {restaurant.city}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{restaurant.email}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{restaurant.phone_number}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm">
            {restaurant.average_rating ? restaurant.average_rating.toFixed(1) : "N/A"} ({restaurant.review_count} avis)
          </span>
        </div>
        
        {restaurant.description && (
          <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
            {restaurant.description}
          </div>
        )}
      </div>
    </div>
    );
  };

  const config: ListingConfig = {
    title: "Gestion des Restaurants",
    description: "Gérez les restaurants de la plateforme",
    columns: columns,
    actions: actions,
    filters: filters,
    searchable: true,
    searchPlaceholder: "Rechercher par nom, ville, type...",
    pagination: {
      enabled: true,
      pageSize: 10,
      showSizeOptions: false,
    },
    viewModes: ["list", "card"],
    refreshable: true,
    stats: [
      { label: "Total", value: totalCount, icon: <Store className="w-5 h-5" /> },
      { label: "Actifs", value: Array.isArray(restaurants) ? restaurants.filter(r => r.status === "active").length : 0, icon: <Store className="w-5 h-5" /> },
      { label: "Suspendus", value: Array.isArray(restaurants) ? restaurants.filter(r => r.status === "suspended").length : 0, icon: <Ban className="w-5 h-5" /> },
      { label: "Ouverts", value: Array.isArray(restaurants) ? restaurants.filter(r => r.is_open).length : 0, icon: <Clock className="w-5 h-5" /> }
    ]
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    loadRestaurants(1, currentFilters, searchQuery);
    setCurrentPage(1);
  }, [currentFilters]);

  useEffect(() => {
    loadRestaurants(1, currentFilters, searchQuery);
    setCurrentPage(1);
  }, [searchQuery]);

  const handleFilterChange = (filters: Record<string, unknown>) => {
    setCurrentFilters(filters);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <UniversalListing
      config={config}
      data={restaurants}
      loading={loading}
      error={error}
      onSearch={setSearchQuery}
      onFilter={setCurrentFilters}
      onRefresh={() => loadRestaurants()}
      onPageChange={setCurrentPage}
      totalCount={totalCount}
      currentPage={currentPage}
      renderCardItem={renderCardView}
    />
  );
}
