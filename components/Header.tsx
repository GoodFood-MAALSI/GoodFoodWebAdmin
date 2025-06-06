"use client";

import { useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/shadcn/navigation-menu";
import Image from "next/image";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function Header({ showNavbar }: { showNavbar: boolean }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 bg-white shadow-md p-4 z-50">
      <div className="container mx-auto flex items-center">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src={`${basePath}/GoodFood/logo-textless.jpg`}
            alt="GoodFoodLogo"
            width={50}
            height={50}
          />
          <h1 className="text-xl font-bold">GoodFood</h1>
        </div>

        <nav className="ml-auto">
          <ul className="flex space-x-4">
            <li>
              <a
                onClick={() => router.push("/")}
                className="hover:underline cursor-pointer"
              >
                Accueil
              </a>
            </li>
            <li>
              <a href="/about" className="hover:underline">
                FAQ
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {showNavbar && (
        <nav className="mt-4 flex justify-center items-center">
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-4">
              <NavigationMenuItem>
                <NavigationMenuLink
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer"
                >
                  Mon Profil
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  onClick={() => router.push("/restaurants")}
                  className="cursor-pointer"
                >
                  Mes Restaurants
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  onClick={() => router.push("/create-menu")}
                  className="cursor-pointer"
                >
                  Gérer le menu
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  onClick={() => router.push("/stats")}
                  className="cursor-pointer"
                >
                  Statistiques
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      )}
    </header>
  );
}
