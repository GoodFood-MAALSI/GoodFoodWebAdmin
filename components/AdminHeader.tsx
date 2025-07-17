"use client";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/Ui/shadcn/button";
import { LogOut, Users, Star, Home, Package, Store } from "lucide-react";
import { toast } from "sonner";
export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/proxy/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to logout");
      toast.success("Déconnexion réussie");
      window.location.href = "/";
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
      window.location.href = "/";
    }
  };
  const navigationItems = [
    {
      label: "Tableau de bord",
      icon: Home,
      path: "/dashboard",
    },
    {
      label: "Utilisateurs",
      icon: Users,
      path: "/users",
    },
    {
      label: "Restaurants",
      icon: Store,
      path: "/restaurants",
    },
    {
      label: "Avis",
      icon: Star,
      path: "/reviews",
    },
    {
      label: "Commandes",
      icon: Package,
      path: "/orders",
    },
  ];
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GF</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">GoodFood Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => router.push(item.path)}
                  className={`${
                    isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
