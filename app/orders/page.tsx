import { Metadata } from "next";
import OrdersManagement from "@/components/OrdersManagement";

export const metadata: Metadata = {
  title: "Gestion des Commandes - Good Food Admin",
  description: "Gérez les commandes des restaurants",
};

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <OrdersManagement />
    </div>
  );
}
