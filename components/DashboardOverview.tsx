"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Ui/shadcn/card";
import { Users, Store, Star, Package, TrendingUp, TrendingDown } from "lucide-react";
import { colors } from "@/app/constants";
import { useStatusCheck } from "@/components/hooks/useStatusCheck";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalRestaurants: number;
  activeRestaurants: number;
  suspendedRestaurants: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalReviews: number;
  averageRating: number;
  totalAdminUsers?: number;
  activeAdminUsers?: number;
  suspendedAdminUsers?: number;
}

export default function DashboardOverview() {
  const { status, isSuperAdmin } = useStatusCheck();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalRestaurants: 0,
    activeRestaurants: 0,
    suspendedRestaurants: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalReviews: 0,
    averageRating: 0,
    totalAdminUsers: 0,
    activeAdminUsers: 0,
    suspendedAdminUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const promises = [
        fetch('/api/proxy/users?limit=100', { credentials: 'include' }).catch(e => {
          return { ok: false, json: () => Promise.resolve({ data: [] }) };
        }),
        fetch('/api/proxy/restaurants?limit=100', { credentials: 'include' }).catch(e => {
          return { ok: false, json: () => Promise.resolve({ data: [] }) };
        }),
        fetch('/api/proxy/orders?limit=100', { credentials: 'include' }).catch(e => {
          return { ok: false, json: () => Promise.resolve({ data: [] }) };
        }),
        fetch('/api/proxy/all-reviews?limit=100', { credentials: 'include' }).catch(e => {
          return { ok: false, json: () => Promise.resolve({ data: [] }) };
        }),
      ];

      if (isSuperAdmin) {
        promises.push(
          fetch('/api/proxy/admin-users?limit=100', { credentials: 'include' }).catch(e => {
            return { ok: false, json: () => Promise.resolve({ data: [] }) };
          })
        );
      }

      const responses = await Promise.all(promises);
      const [usersRes, restaurantsRes, ordersRes, reviewsRes, adminUsersRes] = responses;

      const users = usersRes.ok ? await usersRes.json() : { data: [] };
      const restaurants = restaurantsRes.ok ? await restaurantsRes.json() : { data: [] };
      const orders = ordersRes.ok ? await ordersRes.json() : { data: [] };
      const reviews = reviewsRes.ok ? await reviewsRes.json() : { data: [] };
      const adminUsers = adminUsersRes?.ok ? await adminUsersRes.json() : { data: [] };

      const userData = Array.isArray(users.data) 
        ? users.data 
        : Array.isArray(users.data?.users) 
          ? users.data.users 
          : Array.isArray(users) 
            ? users 
            : [];
            
      const restaurantData = Array.isArray(restaurants.data) 
        ? restaurants.data 
        : Array.isArray(restaurants.data?.restaurants) 
          ? restaurants.data.restaurants 
          : Array.isArray(restaurants) 
            ? restaurants 
            : [];
            
      const orderData = Array.isArray(orders.data) 
        ? orders.data 
        : Array.isArray(orders.data?.orders) 
          ? orders.data.orders 
          : Array.isArray(orders) 
            ? orders 
            : [];
            
      const reviewData = Array.isArray(reviews.data) 
        ? reviews.data 
        : Array.isArray(reviews.data?.reviews) 
          ? reviews.data.reviews 
          : Array.isArray(reviews) 
            ? reviews 
            : [];

      const adminUserData = isSuperAdmin 
        ? (Array.isArray(adminUsers.data) 
            ? adminUsers.data 
            : Array.isArray(adminUsers.data?.users) 
              ? adminUsers.data.users 
              : Array.isArray(adminUsers) 
                ? adminUsers 
                : [])
        : [];

      const newStats: DashboardStats = {
        totalUsers: userData.length,
        activeUsers: userData.filter((u: any) => u?.status === 'active').length,
        suspendedUsers: userData.filter((u: any) => u?.status === 'suspended').length,
        totalRestaurants: restaurantData.length,
        activeRestaurants: restaurantData.filter((r: any) => r?.status === 'active').length,
        suspendedRestaurants: restaurantData.filter((r: any) => r?.status === 'suspended').length,
        totalOrders: orderData.length,
        pendingOrders: orderData.filter((o: any) => o?.status === 'pending' || o?.status === 'confirmed').length,
        completedOrders: orderData.filter((o: any) => o?.status === 'completed').length,
        totalReviews: reviewData.length,
        averageRating: reviewData.length > 0 ? 
          Math.round((reviewData.reduce((acc: number, review: any) => acc + (Number(review?.rating) || 0), 0) / reviewData.length) * 10) / 10 : 0,
        totalAdminUsers: adminUserData.length,
        activeAdminUsers: adminUserData.filter((u: any) => u?.status === 'active').length,
        suspendedAdminUsers: adminUserData.filter((u: any) => u?.status === 'suspended').length,
      };

      setStats(newStats);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status?.authenticated !== false) {
      loadStats();
    }
  }, [status?.authenticated, isSuperAdmin]);

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    color = colors.primary,
    trend 
  }: { 
    title: string; 
    value: string | number; 
    description: string; 
    icon: React.ElementType; 
    color?: string;
    trend?: 'up' | 'down';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          {trend && (
            trend === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme GoodFood</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Restaurateurs"
          value={stats.totalUsers}
          description={`${stats.activeUsers} actifs, ${stats.suspendedUsers} suspendus`}
          icon={Users}
          color={colors.primary}
        />
        {isSuperAdmin && (
          <StatCard
            title="Administrateurs"
            value={stats.totalAdminUsers || 0}
            description={`${stats.activeAdminUsers || 0} actifs, ${stats.suspendedAdminUsers || 0} suspendus`}
            icon={Users}
            color={colors.warning}
          />
        )}
        <StatCard
          title="Restaurants"
          value={stats.totalRestaurants}
          description={`${stats.activeRestaurants} actifs, ${stats.suspendedRestaurants} suspendus`}
          icon={Store}
          color={colors.success}
        />
        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          description={`${stats.pendingOrders} en cours, ${stats.completedOrders} terminées`}
          icon={Package}
          color={colors.warning}
        />
        <StatCard
          title="Avis"
          value={stats.totalReviews}
          description={`Note moyenne: ${stats.averageRating.toFixed(1)}/5`}
          icon={Star}
          color={colors.info}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Restaurateurs</span>
            </CardTitle>
            <CardDescription>Répartition des utilisateurs restaurateurs par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Actifs</span>
                <span className="font-semibold">{stats.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span>Suspendus</span>
                <span className="font-semibold">{stats.suspendedUsers}</span>
              </div>
              <div className="flex justify-between">
                <span>Inactifs</span>
                <span className="font-semibold">{stats.totalUsers - stats.activeUsers - stats.suspendedUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Administrateurs</span>
              </CardTitle>
              <CardDescription>Répartition des utilisateurs administrateurs par statut</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Actifs</span>
                  <span className="font-semibold">{stats.activeAdminUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Suspendus</span>
                  <span className="font-semibold">{stats.suspendedAdminUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inactifs</span>
                  <span className="font-semibold">{(stats.totalAdminUsers || 0) - (stats.activeAdminUsers || 0) - (stats.suspendedAdminUsers || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <span>Restaurants</span>
            </CardTitle>
            <CardDescription>État des restaurants sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Actifs</span>
                <span className="font-semibold">{stats.activeRestaurants}</span>
              </div>
              <div className="flex justify-between">
                <span>Suspendus</span>
                <span className="font-semibold">{stats.suspendedRestaurants}</span>
              </div>
              <div className="flex justify-between">
                <span>Inactifs</span>
                <span className="font-semibold">{stats.totalRestaurants - stats.activeRestaurants - stats.suspendedRestaurants}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Commandes</span>
            </CardTitle>
            <CardDescription>Activité des commandes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>En cours</span>
                <span className="font-semibold">{stats.pendingOrders}</span>
              </div>
              <div className="flex justify-between">
                <span>Terminées</span>
                <span className="font-semibold">{stats.completedOrders}</span>
              </div>
              <div className="flex justify-between">
                <span>Autres</span>
                <span className="font-semibold">{stats.totalOrders - stats.pendingOrders - stats.completedOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
