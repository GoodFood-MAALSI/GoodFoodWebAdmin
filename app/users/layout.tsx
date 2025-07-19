import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion des Utilisateurs - GoodFood Admin",
  description: "Gérez les utilisateurs administrateurs de la plateforme GoodFood",
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
