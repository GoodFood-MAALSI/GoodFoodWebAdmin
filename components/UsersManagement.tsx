"use client";
import { useState, useEffect } from "react";
import UniversalListing, {
  ListingConfig,
  ListingAction,
  ListingColumn,
  ListingFilter,
} from "@/components/UniversalListing";
import { Badge } from "@/components/Ui/shadcn/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/Ui/shadcn/card";
import {
  Users,
  Mail,
  Calendar,
  Ban,
  RotateCcw,
  Edit,
  Trash2,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { colors } from "@/app/constants";
import { toast } from "sonner";
import { useStatusCheck } from "@/components/hooks/useStatusCheck";

interface User {
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

interface UsersResponse {
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UsersManagementProps {
  userType: "basic" | "admin" | "delivery";
}

export default function UsersManagement({ userType }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<Record<string, unknown>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { status, isSuperAdmin } = useStatusCheck();

  const loadUsers = async (
    page = currentPage,
    filters = currentFilters,
    search = searchQuery
  ) => {
    setLoading(true);
    try {
      if (userType === "admin" && !isSuperAdmin) {
        setError("Accès restreint aux super-administrateurs");
        setUsers([]);
        setTotalCount(0);
        return;
      }

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");

      if (filters && filters.status && filters.status !== "__all__") {
        params.append("status", String(filters.status));
      }

      if (search && search.trim()) {
        params.append("search", search);
      }

      // Choose the correct API endpoint based on user type
      const apiEndpoint = userType === "admin" ? "admin-users" : userType === "delivery" ? "delivery-users" : "users";

      const response = await fetch(
        `/api/proxy/${apiEndpoint}?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }

      const data: any = await response.json();

      let usersData: User[] = [];
      let total = 0;

      // Handle different response formats
      if (data.data && data.data.users && Array.isArray(data.data.users)) {
        // New format: { data: { users: [...], meta: {...} } }
        usersData = data.data.users;
        total = data.data.meta?.totalItems || data.pagination?.total || data.data.users.length;
      } else if (data.data && Array.isArray(data.data)) {
        // Old format: { data: [...] }
        usersData = data.data;
        total = data.pagination?.total || data.data.length;
      } else if (Array.isArray(data)) {
        // Direct array format
        usersData = data;
        total = data.length;
      }

      // Filter out super-admin users from frontend display
      usersData = usersData.filter((user: User) => user.role !== "super-admin");

      setUsers(usersData);
      setTotalCount(usersData.length); // Use filtered count instead of backend total
      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: number) => {
    try {
      const apiEndpoint = userType === "admin" ? "admin-users" : userType === "delivery" ? "delivery-users" : "users";
      const response = await fetch(
        `/api/proxy/${apiEndpoint}/${userId}/suspend`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suspension de l'utilisateur");
      }

      await loadUsers();
      toast.success("Utilisateur suspendu avec succès");
    } catch (err) {
      toast.error("Impossible de suspendre l'utilisateur");
    }
  };

  const handleRestoreUser = async (userId: number) => {
    try {
      const apiEndpoint = userType === "admin" ? "admin-users" : userType === "delivery" ? "delivery-users" : "users";
      const response = await fetch(
        `/api/proxy/${apiEndpoint}/${userId}/restore`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la réactivation de l'utilisateur");
      }

      await loadUsers();
      toast.success("Utilisateur réactivé avec succès");
    } catch (err) {
      toast.error("Impossible de réactiver l'utilisateur");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const apiEndpoint = userType === "admin" ? "admin-users" : "users";
      const response = await fetch(`/api/proxy/${apiEndpoint}/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'utilisateur");
      }

      await loadUsers();
      toast.success("Utilisateur supprimé avec succès");
    } catch (err) {
      toast.error("Impossible de supprimer l'utilisateur");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return colors.success;
      case "suspended":
        return colors.warning;
      case "inactive":
        return colors.dark;
      default:
        return colors.teal[600];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "Actif";
      case "suspended":
        return "Suspendu";
      case "inactive":
        return "Inactif";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFullName = (user: User) => {
    const firstName = user.first_name?.trim() || "";
    const lastName = user.last_name?.trim() || "";

    if (!firstName && !lastName) {
      return "Nom non renseigné";
    }

    return `${firstName} ${lastName}`.trim();
  };

  const columns: ListingColumn[] = [
    {
      key: "user",
      label: "Utilisateur",
      sortable: true,
      renderCell: (_: unknown, item: unknown) => {
        const user = item as User;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {getFullName(user)}
              </div>
              <div className="text-sm text-gray-500">
                {user.email || "Email non renseigné"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      renderCell: (_: unknown, item: unknown) => {
        const user = item as User;
        return (
          <div className="flex flex-col space-y-1">
            <Badge
              style={{
                backgroundColor: getStatusColor(user.status),
                color: "white",
              }}
            >
              {getStatusLabel(user.status)}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "dates",
      label: "Dates",
      sortable: false,
      renderCell: (_: unknown, item: unknown) => {
        const user = item as User;
        return (
          <div className="text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Créé: {formatDate(user.created_at)}</span>
            </div>
            {user.updated_at && user.updated_at !== user.created_at && (
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Modifié: {formatDate(user.updated_at)}</span>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const actions: ListingAction[] = [
    {
      id: "suspend",
      label: "Suspendre",
      icon: <Ban className="w-4 h-4" />,
      variant: "destructive",
      isVisible: (item: unknown) => {
        const user = item as User;
        return user.status === "active";
      },
      requiresConfirmation: true,
      confirmationMessage:
        "Êtes-vous sûr de vouloir suspendre cet utilisateur et tous ses restaurants ?",
      onClick: (item: unknown) => handleSuspendUser((item as User).id),
    },
    {
      id: "restore",
      label: "Réactiver",
      icon: <RotateCcw className="w-4 h-4" />,
      variant: "default",
      isVisible: (item: unknown) => {
        const user = item as User;
        return user.status === "suspended";
      },
      requiresConfirmation: true,
      confirmationMessage:
        "Êtes-vous sûr de vouloir réactiver cet utilisateur et tous ses restaurants ?",
      onClick: (item: unknown) => handleRestoreUser((item as User).id),
    },
    {
      id: "delete",
      label: "Supprimer",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive",
      requiresConfirmation: true,
      confirmationMessage:
        "Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ? Cette action est irréversible.",
      onClick: (item: unknown) => handleDeleteUser((item as User).id),
    },
  ];

  const filters: ListingFilter[] = [
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "active", label: "Actif" },
        { value: "suspended", label: "Suspendu" },
        { value: "inactive", label: "Inactif" },
      ],
    },
  ];

  const renderCardView = (item: unknown, index: number) => {
    const user = item as User;
    return (
      <div
        key={index}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <div className="font-medium text-lg">{getFullName(user)}</div>
              <div className="text-sm text-gray-500">
                {user.email || "Email non renseigné"}
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <Badge
              style={{
                backgroundColor: getStatusColor(user.status),
                color: "white",
              }}
            >
              {getStatusLabel(user.status)}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              Créé le {formatDate(user.created_at)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const config: ListingConfig = {
    title:
      userType === "admin"
        ? "Gestion des Utilisateurs Administrateurs"
        : userType === "delivery"
        ? "Gestion des Utilisateurs Livreurs"
        : "Gestion des Utilisateurs Restaurateurs",
    description:
      userType === "admin"
        ? "Gérez les utilisateurs administrateurs de la plateforme"
        : userType === "delivery"
        ? "Gérez les utilisateurs livreurs de la plateforme"
        : "Gérez les utilisateurs restaurateurs de la plateforme",
    columns: columns,
    actions: actions,
    filters: filters,
    searchable: true,
    searchPlaceholder: "Rechercher par nom, email...",
    pagination: {
      enabled: true,
      pageSize: 10,
      showSizeOptions: false,
    },
    viewModes: ["list", "card"],
    refreshable: true,
    stats: [
      {
        label: "Total",
        value: totalCount,
        icon: <Users className="w-5 h-5" />,
      },
      {
        label: "Actifs",
        value: Array.isArray(users)
          ? users.filter((u) => u.status === "active").length
          : 0,
        icon: <CheckCircle className="w-5 h-5" />,
      },
      {
        label: "Suspendus",
        value: Array.isArray(users)
          ? users.filter((u) => u.status === "suspended").length
          : 0,
        icon: <Ban className="w-5 h-5" />,
      },
      {
        label: "Inactifs",
        value: Array.isArray(users)
          ? users.filter((u) => u.status === "inactive").length
          : 0,
        icon: <User className="w-5 h-5" />,
      },
    ],
  };

  const handleFilterChange = (filters: Record<string, unknown>) => {
    setCurrentFilters(filters);
  };

  useEffect(() => {
    if (userType === "basic") {
      loadUsers();
    } else if (userType === "admin" && isSuperAdmin) {
      loadUsers();
    }
  }, [userType, isSuperAdmin]);

  useEffect(() => {
    if (Object.keys(currentFilters).length > 0) {
      loadUsers(1, currentFilters, searchQuery);
      setCurrentPage(1);
    }
  }, [currentFilters]);

  useEffect(() => {
    if (searchQuery !== "") {
      loadUsers(1, currentFilters, searchQuery);
      setCurrentPage(1);
    } else if (searchQuery === "") {
      loadUsers(1, currentFilters, "");
      setCurrentPage(1);
    }
  }, [searchQuery]);

  if (userType === "admin" && !isSuperAdmin) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <AlertCircle className="w-5 h-5 mr-2" />
            Accès restreint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-orange-700">
              La gestion des utilisateurs administrateurs est réservée aux
              super-administrateurs.
            </p>
            <div className="bg-orange-100 p-4 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Votre rôle actuel :</strong>{" "}
                {status?.user?.role || "Non défini"}
              </p>
              <p className="text-sm text-orange-800">
                <strong>Rôle requis :</strong> super-admin
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <UniversalListing
      config={config}
      data={users}
      loading={loading}
      error={error}
      onSearch={setSearchQuery}
      onFilter={handleFilterChange}
      onRefresh={() => loadUsers()}
      onPageChange={setCurrentPage}
      totalCount={totalCount}
      currentPage={currentPage}
      renderCardItem={renderCardView}
    />
  );
}
