import { Metadata } from "next";
import RestaurantsManagement from "@/components/RestaurantsManagement";

export const metadata: Metadata = {
  title: "Gestion des Restaurants - GoodFood Admin",
  description: "Gérez les restaurants de la plateforme GoodFood",
};

export default function RestaurantsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <RestaurantsManagement />
    </div>
  );
}
