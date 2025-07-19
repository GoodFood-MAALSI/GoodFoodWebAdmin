"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/Ui/shadcn/card";
import { Button } from "@/components/Ui/shadcn/button";
import { Input } from "@/components/Ui/shadcn/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Ui/shadcn/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/Ui/shadcn/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Ui/shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Ui/shadcn/select";
import {
  Search,
  RefreshCw,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Eye,
} from "lucide-react";
export interface ListingColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  renderCell?: (value: unknown, item: unknown) => React.ReactNode;
}
export interface ListingAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
  isVisible?: (item: unknown) => boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  onClick: (item: unknown) => Promise<void> | void;
}
export interface ListingFilter {
  key: string;
  label: string;
  type: "select" | "input" | "date";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}
export interface ListingStats {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}
export interface ListingConfig {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  stats?: ListingStats[];
  columns: ListingColumn[];
  actions?: ListingAction[];
  filters?: ListingFilter[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    showSizeOptions?: boolean;
  };
  viewModes?: Array<"list" | "card" | "grid">;
  refreshable?: boolean;
}
export interface UniversalListingProps {
  config: ListingConfig;
  data: unknown[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, unknown>) => void;
  onPageChange?: (page: number) => void;
  totalCount?: number;
  currentPage?: number;
  renderCardItem?: (item: unknown, index: number) => React.ReactNode;
}
export default function UniversalListing({
  config,
  data,
  loading = false,
  error = null,
  onRefresh,
  onSearch,
  onFilter,
  onPageChange,
  totalCount = 0,
  currentPage = 1,
  renderCardItem,
}: UniversalListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>(
    {}
  );
  const [viewMode, setViewMode] = useState<"list" | "card" | "grid">("list");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };
  const handleFilterChange = (key: string, value: unknown) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value || value === "__all__") {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFilter?.(newFilters);
  };
  const handleActionClick = async (action: ListingAction, item: unknown) => {
    if (action.requiresConfirmation) {
      setConfirmDialog({
        isOpen: true,
        title: action.label,
        message:
          action.confirmationMessage ||
          `Êtes-vous sûr de vouloir ${action.label.toLowerCase()} cet élément ?`,
        onConfirm: async () => {
          await action.onClick(item);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        },
      });
    } else {
      await action.onClick(item);
    }
  };
  const pageSize = config.pagination?.pageSize || 10;
  const totalPages = Math.ceil(totalCount / pageSize);
  const renderStats = () => {
    if (!config.stats || config.stats.length === 0) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {config.stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                {stat.icon && (
                  <div
                    className="p-2 rounded-full"
                    style={{
                      backgroundColor: stat.color
                        ? `${stat.color}20`
                        : "#f3f4f6",
                    }}
                  >
                    <div style={{ color: stat.color }}>{stat.icon}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  const renderToolbar = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {config.searchable && (
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={config.searchPlaceholder || "Rechercher..."}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}
      {config.filters && config.filters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {config.filters.map((filter) => (
            <Select
              key={filter.key}
              value={String(activeFilters[filter.key] || "__all__")}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tous</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
      {config.viewModes && config.viewModes.length > 1 && (
        <div className="flex rounded-lg border">
          {config.viewModes.map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="rounded-none first:rounded-l-lg last:rounded-r-lg"
            >
              {mode === "list" && <List className="w-4 h-4" />}
              {mode === "card" && <Eye className="w-4 h-4" />}
              {mode === "grid" && <Grid className="w-4 h-4" />}
            </Button>
          ))}
        </div>
      )}
      {config.refreshable && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      )}
    </div>
  );
  const renderTableView = () => (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {config.columns.map((column) => (
              <TableHead key={column.key} style={{ width: column.width }}>
                {column.label}
              </TableHead>
            ))}
            {config.actions && config.actions.length > 0 && (
              <TableHead className="w-[100px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              {config.columns.map((column) => (
                <TableCell key={column.key}>
                  {column.renderCell
                    ? column.renderCell(
                        (item as Record<string, unknown>)[column.key],
                        item
                      )
                    : String(
                        (item as Record<string, unknown>)[column.key] || ""
                      )}
                </TableCell>
              ))}
              {config.actions && config.actions.length > 0 && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {config.actions
                        .filter(
                          (action) =>
                            !action.isVisible || action.isVisible(item)
                        )
                        .map((action) => (
                          <DropdownMenuItem
                            key={action.id}
                            onClick={() => handleActionClick(action, item)}
                            className={`
                              ${
                                action.variant === "destructive"
                                  ? "text-red-600 focus:text-red-600"
                                  : ""
                              }
                              ${
                                action.variant === "success"
                                  ? "text-green-600 focus:text-green-600"
                                  : ""
                              }
                              ${
                                action.variant === "warning"
                                  ? "text-yellow-600 focus:text-yellow-600"
                                  : ""
                              }
                            `}
                          >
                            {action.icon && (
                              <span className="mr-2">{action.icon}</span>
                            )}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item, index) => (
        <Card key={index} className="relative">
          {config.actions && config.actions.length > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {config.actions
                    .filter(
                      (action) => !action.isVisible || action.isVisible(item)
                    )
                    .map((action) => (
                      <DropdownMenuItem
                        key={action.id}
                        onClick={() => handleActionClick(action, item)}
                        className={`
                          ${
                            action.variant === "destructive"
                              ? "text-red-600 focus:text-red-600"
                              : ""
                          }
                          ${
                            action.variant === "success"
                              ? "text-green-600 focus:text-green-600"
                              : ""
                          }
                          ${
                            action.variant === "warning"
                              ? "text-yellow-600 focus:text-yellow-600"
                              : ""
                          }
                        `}
                      >
                        {action.icon && (
                          <span className="mr-2">{action.icon}</span>
                        )}
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <CardContent className="p-0">
            {renderCardItem ? (
              renderCardItem(item, index)
            ) : (
              <div className="p-4">
                {config.columns.slice(0, 3).map((column) => (
                  <div key={column.key} className="mb-2">
                    <span className="font-medium text-sm text-gray-600">
                      {column.label}:{" "}
                    </span>
                    <span className="text-sm">
                      {column.renderCell
                        ? column.renderCell(
                            (item as Record<string, unknown>)[column.key],
                            item
                          )
                        : String(
                            (item as Record<string, unknown>)[column.key] || ""
                          )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
  const renderPagination = () => {
    if (!config.pagination?.enabled || totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-gray-700">
          Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
          {Math.min(currentPage * pageSize, totalCount)} sur {totalCount}{" "}
          résultats
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {config.icon}
          <div>
            <h1 className="text-3xl font-bold">{config.title}</h1>
            {config.description && (
              <p className="text-gray-600 mt-1">{config.description}</p>
            )}
          </div>
        </div>
      </div>
      {renderStats()}
      {renderToolbar()}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          {config.refreshable && (
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          )}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun élément trouvé</p>
        </div>
      ) : (
        <>
          {viewMode === "list" && renderTableView()}
          {viewMode === "card" && renderCardView()}
          {renderPagination()}
        </>
      )}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, isOpen: open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, isOpen: false })
              }
            >
              Annuler
            </Button>
            <Button onClick={confirmDialog.onConfirm}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
