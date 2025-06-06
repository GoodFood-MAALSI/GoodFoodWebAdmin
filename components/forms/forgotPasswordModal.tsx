"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/shadcn/dialog";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/shadcn/form";
import { useForgotPassword } from "@/components/hooks/useForgotPassword";
import { loginTexts } from "@/app/auth/constants";

export function ForgotPasswordModal() {
  const [open, setOpen] = useState(false);
  const { form, handleSubmit, onSubmit, emailSent } = useForgotPassword(() => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-blue-600 underline"
        >
          {loginTexts.forgotPassword.button}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{loginTexts.forgotPassword.title}</DialogTitle>
          <DialogDescription>
            {loginTexts.forgotPassword.modal.description}
          </DialogDescription>
        </DialogHeader>

        {emailSent ? (
          <p className="text-green-600 mt-4">
            {loginTexts.forgotPassword.modal.success}
          </p>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                {loginTexts.forgotPassword.modal.confirmButton}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
