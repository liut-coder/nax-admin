import {
  ClipboardList,
  FileText,
  Folder,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  ListTree,
  Settings,
  ShieldCheck,
  Table2,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/cn";

const groups = [
  {
    label: "STARTER",
    items: [{ to: "/dashboard", label: "脚手架总览", icon: LayoutDashboard }],
  },
  {
    label: "ADMIN API",
    items: [
      { to: "/admin/users", label: "用户管理", icon: Users },
      { to: "/admin/roles", label: "角色管理", icon: ShieldCheck },
      { to: "/admin/permissions", label: "权限字典", icon: KeyRound },
      { to: "/admin/settings", label: "系统设置", icon: Settings },
      { to: "/admin/dictionaries", label: "数据字典", icon: ListTree },
      { to: "/admin/audit-logs", label: "审计日志", icon: ClipboardList },
      { to: "/admin/files", label: "文件管理", icon: Folder },
    ],
  },
  {
    label: "TEMPLATES",
    items: [
      { to: "/examples/table", label: "表格示例", icon: Table2 },
      { to: "/examples/form", label: "表单示例", icon: FileText },
      { to: "/examples/detail", label: "详情示例", icon: ClipboardList },
      { to: "/examples/wizard", label: "流程示例", icon: ListChecks },
    ],
  },
  {
    label: "SYSTEM",
    items: [{ to: "/403", label: "权限示例", icon: ShieldCheck }],
  },
];

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-[232px] border-r bg-surface">
      <div className="flex h-[64px] items-center border-b px-6">
        <img
          src={appConfig.logoHorizontal}
          alt={appConfig.name}
          className="h-8 w-auto"
        />
      </div>
      <nav className="flex h-[calc(100vh-64px)] flex-col gap-6 overflow-y-auto px-4 py-5">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-3 px-2 text-xs font-medium text-muted-foreground">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                      isActive &&
                        "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white dark:bg-zinc-100 dark:text-zinc-950",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        <button className="mt-auto flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted">
          收起侧边栏
        </button>
      </nav>
    </aside>
  );
}
