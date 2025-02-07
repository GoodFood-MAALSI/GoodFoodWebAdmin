import { cn } from "../../shared/cn";
import React from "react";

export function Table({ children }) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">{children}</table>
      </div>
    );
  }
  
  export function TableHeader({ children }) {
    return (
      <thead className="bg-gray-100 border-b border-gray-300">{children}</thead>
    );
  }
  
  export function TableBody({ children }) {
    return <tbody>{children}</tbody>;
  }
  
  export function TableRow({ children }) {
    return <tr className="border-b border-gray-300">{children}</tr>;
  }
  
  export function TableCell({ children, className }) {
    return (
      <td className={cn("p-3 text-left", className)}>
        {children}
      </td>
    );
  }
  