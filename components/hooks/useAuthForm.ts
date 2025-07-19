"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validators/auth";
import { loginTexts } from "@/app/constants";
import type { LoginForm } from "@/types/auth";
import type { LoginResponse } from "@/types/api";
export function useAuthForm() {
  const router = useRouter();
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await fetch("/api/proxy/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error("Erreur de serveur - réponse HTML reçue");
        }
        throw new Error(errorData.message || loginTexts.error.default);
      }
      const loginResponse = (await response.json()) as LoginResponse;  
      const forcePasswordChange = loginResponse.data?.force_password_change || loginResponse.data?.user?.force_password_change;
      
      if (forcePasswordChange) {
        toast.success("Connexion réussie ! Vous devez changer votre mot de passe.");
        window.location.href = "/change-password";
      } else {
        toast.success("Connexion réussie ! Redirection en cours...");
        window.location.href = "/dashboard";
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "message" in error) {
        toast.error((error as { message: string }).message || loginTexts.error.default);
      } else {
        toast.error(loginTexts.error.default);
      }
    }
  };
  return {
    form,
    onSubmit,
    handleSubmit: form.handleSubmit,
    router,
  };
}
