import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="min-h-screen pl-[232px]">
        <AppHeader />
        <Outlet />
      </div>
    </div>
  );
}
