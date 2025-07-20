"use client";
import ReviewsManagement from "@/components/ReviewsManagement";
import { useStatusCheck } from "@/components/hooks/useStatusCheck";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReviewsPage() {
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return <ReviewsManagement />;
}
