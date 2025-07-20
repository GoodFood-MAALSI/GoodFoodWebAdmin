"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Ui/shadcn/card";
import { AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function NotAllowedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/proxy/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Clear any client-side storage if needed
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = "/";
      } else {
        toast.error("Erreur lors de la déconnexion");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout fails
      window.location.href = "/";
    }
  };

  // Prevent navigation away from this page for suspended users
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = () => {
      // Block back button navigation
      window.history.pushState(null, "", window.location.href);
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push current state to prevent back navigation
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Accès suspendu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Votre compte administrateur a été suspendu.
            </p>
            <p className="text-sm text-gray-500">
              Veuillez contacter un super-administrateur pour plus d'informations.
            </p>
          </div>
          
          <Button 
            onClick={handleLogout}
            className="w-full"
            variant="destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
