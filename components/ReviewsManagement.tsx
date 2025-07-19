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
  Star,
  MessageSquare,
  Ban,
  RotateCcw,
  User,
  MapPin,
  Calendar
} from "lucide-react";
import { colors } from "@/app/constants";
import { toast } from "sonner";
interface Review {
  id: number;
  review: string;
  rating: number;
  status: 'active' | 'suspended';
  restaurantId: number;
  clientId: number;
  created_at: string;
  updated_at: string;
  restaurant?: {
    id: number;
    name: string;
    street_number?: string;
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  client?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
interface ReviewsResponse {
  data: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<Record<string, unknown>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const loadReviews = async (page = currentPage, filters = currentFilters, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      
      if (filters && filters.rating) params.append('rating', String(filters.rating));
      if (filters && filters.status) params.append('status', String(filters.status));
      const response = await fetch(`/api/proxy/all-reviews?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des avis");
      }
      const data: ReviewsResponse = await response.json();
      let reviewsData: Review[] = [];
      let total = 0;
      if (data.data && Array.isArray(data.data)) {
        reviewsData = data.data;
        total = data.pagination?.total || data.data.length;
      } else if (Array.isArray(data)) {
        reviewsData = data;
        total = data.length;
      }
      if (search && search.trim()) {
        reviewsData = reviewsData.filter(review =>
          review.review.toLowerCase().includes(search.toLowerCase()) ||
          (review.client && (
            review.client.firstName.toLowerCase().includes(search.toLowerCase()) ||
            review.client.lastName.toLowerCase().includes(search.toLowerCase()) ||
            review.client.email.toLowerCase().includes(search.toLowerCase())
          )) ||
          (review.restaurant && review.restaurant.name.toLowerCase().includes(search.toLowerCase())) ||
          review.clientId.toString().includes(search)
        );
      }
      setReviews(reviewsData);
      setTotalCount(total);
      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadReviews();
  }, []);
  const suspendReview = async (review: Review) => {
    try {
      const response = await fetch(`/api/proxy/reviews/${review.id}/suspend`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suspension de l'avis");
      }
      toast.success("Avis suspendu avec succès");
      await loadReviews();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la suspension de l'avis");
      throw error;
    }
  };
  const restoreReview = async (review: Review) => {
    try {
      const response = await fetch(`/api/proxy/reviews/${review.id}/restore`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la restauration de l'avis");
      }
      toast.success("Avis restauré avec succès");
      await loadReviews();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la restauration de l'avis");
      throw error;
    }
  };
  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating}/5</span>
    </div>
  );
  const columns: ListingColumn[] = [
    {
      key: "rating",
      label: "Note",
      sortable: true,
      filterable: true,
      width: "120px",
      renderCell: (value: unknown) => renderStars(value as number)
    },
    {
      key: "review",
      label: "Avis",
      sortable: false,
      renderCell: (value: unknown) => (
        <div className="max-w-md">
          <p className="text-sm truncate" title={value as string}>
            &quot;{value as string}&quot;
          </p>
        </div>
      )
    },
    {
      key: "client",
      label: "Client",
      sortable: false,
      renderCell: (_: unknown, item: unknown) => {
        const review = item as Review;
        return review.client ? (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">
                {review.client.firstName} {review.client.lastName}
              </p>
              <p className="text-xs text-gray-500">{review.client.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Client #{review.clientId}</span>
          </div>
        );
      }
    },
    {
      key: "restaurant",
      label: "Restaurant",
      sortable: false,
      renderCell: (_: unknown, item: unknown) => {
        const review = item as Review;
        return review.restaurant ? (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">{review.restaurant.name}</p>
              {(review.restaurant.street_number || review.restaurant.street || review.restaurant.city) && (
                <p className="text-xs text-gray-500">
                  {[review.restaurant.street_number, review.restaurant.street, review.restaurant.city].filter(Boolean).join(' ')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Restaurant inconnu</span>
        );
      }
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      filterable: true,
      width: "120px",
      renderCell: (value: unknown) => (
        <Badge
          className="text-white font-medium"
          style={{
            backgroundColor: (value as string) === 'active' ? colors.success : colors.warning
          }}
        >
          {(value as string) === 'active' ? '✓ Actif' : '⚠ Suspendu'}
        </Badge>
      )
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      width: "120px",
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
      id: "suspend",
      label: "Suspendre",
      icon: <Ban className="w-4 h-4" />,
      variant: "warning",
      isVisible: (item: unknown) => (item as Review).status === "active",
      requiresConfirmation: true,
      confirmationMessage: "Êtes-vous sûr de vouloir suspendre cet avis ?",
      onClick: (item: unknown) => suspendReview(item as Review)
    },
    {
      id: "restore",
      label: "Restaurer",
      icon: <RotateCcw className="w-4 h-4" />,
      variant: "success",
      isVisible: (item: unknown) => (item as Review).status === "suspended",
      onClick: (item: unknown) => restoreReview(item as Review)
    }
  ];
  const filters: ListingFilter[] = [
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "active", label: "Actif" },
        { value: "suspended", label: "Suspendu" }
      ]
    },
    {
      key: "rating",
      label: "Note",
      type: "select",
      options: [
        { value: "5", label: "5 étoiles" },
        { value: "4", label: "4 étoiles" },
        { value: "3", label: "3 étoiles" },
        { value: "2", label: "2 étoiles" },
        { value: "1", label: "1 étoile" }
      ]
    }
  ];
  const stats: ListingStats[] = [
    {
      label: "Total Avis",
      value: reviews.length,
      icon: <MessageSquare className="w-6 h-6" />,
      color: colors.primary
    },
    {
      label: "Avis Actifs",
      value: reviews.filter(r => r.status === "active").length,
      icon: <Star className="w-6 h-6" />,
      color: colors.success
    },
    {
      label: "Avis Suspendus",
      value: reviews.filter(r => r.status === "suspended").length,
      icon: <Ban className="w-6 h-6" />,
      color: colors.warning
    },
    {
      label: "Note Moyenne",
      value: reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "0",
      icon: <Star className="w-6 h-6" />,
      color: colors.accent
    }
  ];
  const config: ListingConfig = {
    title: "Gestion des Avis",
    description: "Modérez et gérez tous les avis clients",
    icon: <MessageSquare className="w-6 h-6" />,
    stats,
    columns,
    actions,
    filters,
    searchable: true,
    searchPlaceholder: "Rechercher dans les avis, clients, restaurants...",
    pagination: {
      enabled: true,
      pageSize: 10,
      showSizeOptions: true
    },
    viewModes: ['list', 'card'],
    refreshable: true
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadReviews(1, currentFilters, query);
  };
  const handleFilter = (filters: Record<string, unknown>) => {
    setCurrentFilters(filters);
    loadReviews(1, filters, searchQuery);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadReviews(page, currentFilters, searchQuery);
  };
  const handleRefresh = () => {
    loadReviews(currentPage, currentFilters, searchQuery);
  };
  const renderCardItem = (item: unknown, _index: number) => {
    const review = item as Review;
    return (
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              {renderStars(review.rating)}
              <Badge
                className="text-white font-medium"
                style={{
                  backgroundColor: review.status === 'active' ? colors.success : colors.warning
                }}
              >
                {review.status === 'active' ? '✓ Actif' : '⚠ Suspendu'}
              </Badge>
            </div>
            <blockquote className="text-gray-700 italic mb-4 p-3 bg-gray-50 rounded-lg border-l-4"
                        style={{ borderLeftColor: colors.primary }}>
              &quot;{review.review}&quot;
            </blockquote>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {review.client ? `${review.client.firstName} ${review.client.lastName}` : "Client inconnu"}
                  </p>
                  {review.client?.email && (
                    <p className="text-gray-500">{review.client.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {review.restaurant?.name || "Restaurant inconnu"}
                  </p>
                  {(review.restaurant?.street_number || review.restaurant?.street || review.restaurant?.city) && (
                    <p className="text-gray-500">
                      {[review.restaurant?.street_number, review.restaurant?.street, review.restaurant?.city].filter(Boolean).join(' ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <div>
                <span>Créé le {new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                <span className="ml-2">à {new Date(review.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
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
      data={reviews}
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
