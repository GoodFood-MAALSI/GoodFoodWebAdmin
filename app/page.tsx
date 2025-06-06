"use client";

import AuthForm from "@/components/forms/AuthForm";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-lg rounded-lg">
        <AuthForm />
      </div>
    </div>
  );
}
