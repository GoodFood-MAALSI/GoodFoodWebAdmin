"use client";
import UsersPageContent from "@/components/UsersPageContent";
import { useStatusCheck } from "@/components/hooks/useStatusCheck";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Ui/shadcn/card";
import { AlertCircle, Shield } from "lucide-react";

function UsersPageContentWrapper() {
  const { status, loading, error } = useStatusCheck();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !error) {
      if (!status?.authenticated) {
        router.push("/");
        return;
      }
      // Check if user is suspended
      if (status?.user?.status === 'suspended') {
        router.push("/notallowed");
        return;
      }
    }
  }, [status, loading, error, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !status?.authenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              Erreur d'authentification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {error || "Vous devez être connecté pour accéder à cette page."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UsersPageContent />
    </div>
  );
}

export default function UsersPage() {
  return <UsersPageContentWrapper />;
}
