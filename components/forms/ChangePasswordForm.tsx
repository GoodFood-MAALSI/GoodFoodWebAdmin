"use client";

import { useChangePassword } from "@/components/hooks/useChangePassword";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/shadcn/form";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";

export function ChangePasswordForm() {
  const { form, handleSubmit, onSubmit, isLoading } = useChangePassword();

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouveau mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Envoi..." : "Réinitialiser"}
        </Button>
      </form>
    </Form>
  );
}
