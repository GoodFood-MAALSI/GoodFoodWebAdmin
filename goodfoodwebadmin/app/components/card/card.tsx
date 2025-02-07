import { cn } from "../../shared/cn";
import React from "react";

export function Card({ children, className }) {
  return (
    <div className={cn("bg-white shadow-lg rounded-2xl p-4", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="mb-2 font-semibold text-lg">{children}</div>;
}

export function CardTitle({ children }) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}

export function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}