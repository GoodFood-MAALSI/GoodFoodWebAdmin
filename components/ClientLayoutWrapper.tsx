"use client";
import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { AuthGuard } from "@/components/AuthGuard";

const NO_HEADER_ROUTES = [
  "/", 
  "/change-password", 
  "/notallowed",
];

const PUBLIC_ROUTES = [
  "/", 
];

const NO_AUTH_GUARD_ROUTES = [
  "/",
  "/notallowed",
];

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  console.log("ClientLayoutWrapper - Pathname:", pathname);
  
  const shouldShowHeader = !NO_HEADER_ROUTES.includes(pathname);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const skipAuthGuard = NO_AUTH_GUARD_ROUTES.includes(pathname);

  console.log("ClientLayoutWrapper - Config:", { shouldShowHeader, isPublicRoute, skipAuthGuard });

  if (isPublicRoute) {
    console.log("ClientLayoutWrapper - Returning public route");
    return <>{children}</>;
  }

  if (skipAuthGuard) {
    console.log("ClientLayoutWrapper - Skipping AuthGuard");
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  console.log("ClientLayoutWrapper - Using AuthGuard");
  return (
    <AuthGuard>
      {shouldShowHeader && <AdminHeader />}
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </AuthGuard>
  );
}
