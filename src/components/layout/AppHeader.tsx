import {
  Bell,
  ChevronDown,
  HelpCircle,
  Search,
  Settings,
  SunMoon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { logoutSession } from "@/features/auth/api";
import { logout, useAuthStore } from "@/store/auth";
import { useUiStore } from "@/store/ui";

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b bg-surface/95 px-8 backdrop-blur">
      <div className="relative w-[280px]">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input className="h-9 bg-background pl-9" placeholder="搜索 (⌘ + K)" />
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-white">
            3
          </span>
        </Button>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <SunMoon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                {user?.avatar || "NA"}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">
                  {user?.name || "Administrator"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.role || "Administrator"}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>个人资料</DropdownMenuItem>
            <DropdownMenuItem>账户设置</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void handleLogout()}>
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
async function handleLogout() {
  try {
    await logoutSession();
  } finally {
    logout();
    window.location.href = "/login";
  }
}
