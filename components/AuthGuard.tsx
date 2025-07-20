"use client";
import { useStatusCheck } from "@/components/hooks/useStatusCheck";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
interface AuthGuardProps {
  children: React.ReactNode;
  requirePasswordChange?: boolean;
}
export function AuthGuard({ children, requirePasswordChange = false }: AuthGuardProps) {
  console.log("AuthGuard - Component rendered");
  const { status, loading, isAuthenticated, needsPasswordChange } = useStatusCheck();
  const router = useRouter();
  
  console.log("AuthGuard - Status:", { status, loading, isAuthenticated, needsPasswordChange });
  
  useEffect(() => {
    console.log("AuthGuard - useEffect triggered", { loading, isAuthenticated, needsPasswordChange });
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    if (needsPasswordChange && !requirePasswordChange) {
      router.replace("/change-password");
      return;
    }
    if (!needsPasswordChange && requirePasswordChange) {
      router.replace("/dashboard");
      return;
    }
  }, [loading, isAuthenticated, needsPasswordChange, requirePasswordChange, router]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return null; 
  }
  if (needsPasswordChange && !requirePasswordChange) {
    return null; 
  }
  if (!needsPasswordChange && requirePasswordChange) {
    return null; 
  }
  return <>{children}</>;
}
