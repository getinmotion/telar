import React from "react";
import { CommercialDashboard } from "@/components/dashboard/CommercialDashboard";
import { useAutoTaskCompletion } from "@/hooks/useAutoTaskCompletion";
import { useTaskReconciliation } from "@/hooks/useTaskReconciliation";

const DashboardHome = () => {
  useAutoTaskCompletion();
  useTaskReconciliation();
  return <CommercialDashboard />;
};

export default DashboardHome;
