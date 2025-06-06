import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import type { ForgotPasswordForm } from "@/types/auth";
import { NEXT_PUBLIC_API_URL } from "@/app/constants";
import { loginTexts } from "@/app/auth/constants";
import { toast } from "sonner";

export function useForgotPassword(onClose?: () => void) {
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || loginTexts.error.default);
      }

      toast.success("Lien de réinitialisation envoyé.");
      setEmailSent(true);

      setTimeout(() => {
        onClose?.();
        form.reset();
        setEmailSent(false);
      }, 1500);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : loginTexts.error.default;
      toast.error(message);
    }
  };

  return {
    form,
    onSubmit,
    handleSubmit: form.handleSubmit,
    emailSent,
  };
}
