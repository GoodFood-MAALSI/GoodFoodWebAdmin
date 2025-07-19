"use client";
import { useState, useEffect } from "react";
interface AuthStatus {
  authenticated: boolean;
  force_password_change?: boolean;
  user?: {
    id: number;
    email: string;
    status: string;
    first_name: string;
    last_name: string;
    role: string;
    created_at?: string;
    updated_at?: string;
    __entity?: string;
  };
  data?: {
    user?: {
      id: number;
      email: string;
      status: string;
      first_name: string;
      last_name: string;
      role: string;
      created_at?: string;
      updated_at?: string;
      __entity?: string;
    };
    force_password_change?: boolean;
  };
  message?: string;
}
export function useStatusCheck() {
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/proxy/auth/status", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      
      if (!response.ok) {
        setStatus({ authenticated: false, message: data.message });
        setError(data.message);
        return;
      }

      let normalizedStatus: AuthStatus = {
        authenticated: data.authenticated !== false,
        force_password_change: data.force_password_change || data.data?.force_password_change || false,
        user: data.user || data.data?.user || null,
        message: data.message
      };

      setStatus(normalizedStatus);
    } catch (err) {
      setStatus({ authenticated: false });
      setError("Erreur lors de la vérification du statut");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkStatus();
  }, []);
  return {
    status,
    loading,
    error,
    checkStatus,
    isAuthenticated: status?.authenticated || false,
    needsPasswordChange: status?.force_password_change || false,
    userRole: status?.user?.role || null,
    isSuperAdmin: status?.user?.role === "super-admin",
    isAdmin: status?.user?.role === "admin" || status?.user?.role === "super-admin",
    userId: status?.user?.id || null,
    userEmail: status?.user?.email || null,
    userName: status?.user ? `${status.user.first_name} ${status.user.last_name}`.trim() : null,
  };
}
