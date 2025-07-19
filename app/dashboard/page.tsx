import { Metadata } from "next";
import DashboardOverview from "@/components/DashboardOverview";

export const metadata: Metadata = {
  title: "Tableau de bord - GoodFood Admin",
  description: "Tableau de bord administrateur pour la gestion de la plateforme GoodFood",
};

export default function Dashboard() {
  return <DashboardOverview />;
}