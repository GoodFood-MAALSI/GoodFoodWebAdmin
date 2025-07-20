"use client";
import { useState } from "react";
import { useStatusCheck } from "@/components/hooks/useStatusCheck";
import UsersManagement from "@/components/UsersManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Ui/shadcn/card";
import { Button } from "@/components/Ui/shadcn/button";
import { Users, Shield, UserCheck, Truck } from "lucide-react";

export default function UsersPageContent() {
  const { status, isSuperAdmin, isAdmin } = useStatusCheck();
  const [activeTab, setActiveTab] = useState<'basic' | 'admin' | 'delivery'>('basic');

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex space-x-4 border-b border-gray-200">
          <Button
            variant={activeTab === 'basic' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('basic')}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Utilisateurs Restaurateurs</span>
          </Button>
          {isSuperAdmin && (
            <Button
              variant={activeTab === 'admin' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('admin')}
              className="flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Utilisateurs Administrateurs</span>
            </Button>
          )}
          <Button
            variant={activeTab === 'delivery' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('delivery')}
            className="flex items-center space-x-2"
          >
            <Truck className="w-4 h-4" />
            <span>Utilisateurs Livreurs</span>
          </Button>
        </div>
      )}

      {!isAdmin && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <UserCheck className="w-5 h-5 mr-2" />
              Gestion des utilisateurs restaurateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-blue-700">
                Vous pouvez consulter et gérer les utilisateurs restaurateurs de la plateforme.
              </p>
              <div className="bg-blue-100 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Votre rôle :</strong> {status?.user?.role || "Non défini"}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Nom :</strong> {status?.user ? `${status.user.first_name} ${status.user.last_name}` : "Non défini"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'basic' && (
        <UsersManagement userType="basic" />
      )}

      {activeTab === 'admin' && isSuperAdmin && (
        <UsersManagement userType="admin" />
      )}

      {activeTab === 'delivery' && isAdmin && (
        <UsersManagement userType="delivery" />
      )}
    </div>
  );
}
