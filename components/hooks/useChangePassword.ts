"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/lib/validators/auth";
import type { ChangePasswordForm } from "@/types/auth";
import { toast } from "sonner";
import { useState } from "react";
import { NEXT_PUBLIC_API_URL } from "@/app/constants";

export function useChangePassword() {
  const { hash } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    if (!hash || typeof hash !== "string") {
      toast.error("Lien de réinitialisation invalide.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password, hash }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur inconnue.");
      }

      toast.success("Mot de passe réinitialisé !");
      router.push("/auth");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    handleSubmit: form.handleSubmit,
    onSubmit,
    isLoading,
  };
}
