"use client";
import { useRouter } from "next/navigation";
export function useLogout() {
  const router = useRouter();
  const logout = async () => {
    try {
      await fetch("/api/proxy/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (error) {
      window.location.href = "/";
    }
  };
  return { logout };
}
