import React from 'react';
import { useAdminShops } from '@/hooks/useAdminShops';
import { ShopStatsCards } from './ShopStatsCards';
import { ShopStatusCharts } from './ShopStatusCharts';
import { ShopFilters } from './ShopFilters';
import { ShopTable } from './ShopTable';
import { BulkActionsBar } from './BulkActionsBar';
import { Store } from 'lucide-react';

export const AdminShopsPanel: React.FC = () => {
  const {
    shops,
    stats,
    loading,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    selectedShops,
    toggleSelectShop,
    selectAllFiltered,
    clearSelection,
    actionLoading,
    approveMarketplace,
    rejectMarketplace,
    togglePublish,
    deleteShop,
    createCobre,
    bulkApprove,
    bulkReject,
    refetch,
  } = useAdminShops();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Gestión de Tiendas</h2>
          <p className="text-sm text-muted-foreground">
            Dashboard completo para administrar las tiendas artesanales
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <ShopStatsCards stats={stats} loading={loading} />

      {/* Charts */}
      <ShopStatusCharts stats={stats} />

      {/* Filters */}
      <ShopFilters
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stats={stats}
        onRefresh={refetch}
        loading={loading}
      />

      {/* Table */}
      <ShopTable
        shops={shops}
        selectedShops={selectedShops}
        onToggleSelect={toggleSelectShop}
        onSelectAll={() => {
          if (selectedShops.length === shops.length) {
            clearSelection();
          } else {
            selectAllFiltered();
          }
        }}
        onApprove={approveMarketplace}
        onReject={rejectMarketplace}
        onTogglePublish={togglePublish}
        onDelete={deleteShop}
        onCreateCobre={createCobre}
        actionLoading={actionLoading}
        loading={loading}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedShops.length}
        onApprove={bulkApprove}
        onReject={bulkReject}
        onClear={clearSelection}
        loading={!!actionLoading}
      />
    </div>
  );
};

export default AdminShopsPanel;
