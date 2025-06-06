"use client";

import { useAuthForm } from "@/components/hooks/useAuthForm";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/shadcn/form";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";
import { loginTexts } from "@/app/auth/constants";
import { ForgotPasswordModal } from "@/components/forms/forgotPasswordModal";

export default function AuthForm() {
  const { form, handleSubmit, onSubmit, router } = useAuthForm();

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{loginTexts.fields.email.label}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={loginTexts.fields.email.placeholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{loginTexts.fields.password.label}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={loginTexts.fields.password.placeholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full text-white hover:opacity-90"
            style={{ backgroundColor: loginTexts.colors.submit }}
          >
            {loginTexts.submitButton}
          </Button>
          <ForgotPasswordModal />
        </form>
      </Form>

      <div className="text-center">
        <p>{loginTexts.footer.prompt}</p>
        <Button
          onClick={() => router.push("/create-company")}
          className="mt-2 w-full text-white hover:opacity-90"
          style={{ backgroundColor: loginTexts.colors.secondary }}
        >
          {loginTexts.footer.createButton}
        </Button>
      </div>
    </>
  );
}
