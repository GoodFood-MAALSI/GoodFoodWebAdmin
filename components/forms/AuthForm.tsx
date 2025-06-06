"use client";

import { useAuthForm } from "@/components/hooks/useAuthForm";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/Ui/shadcn/form";
import { Input } from "@/components/Ui/shadcn/input";
import { Button } from "@/components/Ui/shadcn/button";
import { loginTexts } from "@/app/constants";

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
        </form>
      </Form>
    </>
  );
}
