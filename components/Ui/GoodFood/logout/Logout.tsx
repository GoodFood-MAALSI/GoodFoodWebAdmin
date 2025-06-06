"use client";

import { Button } from "@/components/ui/shadcn/button";
import { useLogout } from "@/components/hooks/useLogout";

const LogoutSection: React.FC = () => {
  const logout = useLogout();

  return (
    <div className="flex justify-end">
      <Button variant="destructive" onClick={logout}>
        Se déconnecter
      </Button>
    </div>
  );
};

export default LogoutSection;
