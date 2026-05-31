import { Globe2, Moon, Sun } from "lucide-react";
import { Outlet } from "react-router-dom";
import { appConfig } from "@/config/app";
import { changeLanguage } from "@/locales/i18n";
import { useUiStore } from "@/store/ui";

export function AuthLayout() {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7fbff]">
      <img
        src={appConfig.loginBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-white/25" />
      <div className="absolute right-10 top-8 z-10 flex items-center gap-3">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-lg border bg-white/80 px-4 text-sm shadow-login backdrop-blur"
          onClick={() => changeLanguage("zh")}
        >
          <Globe2 className="h-4 w-4" />
          简体中文
        </button>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-white/80 shadow-login backdrop-blur"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="relative z-10 flex min-h-screen items-center px-10">
        <Outlet />
      </div>
    </div>
  );
}
