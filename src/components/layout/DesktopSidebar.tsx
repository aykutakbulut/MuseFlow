"use client";

import React from "react";
import Image from "next/image";
import { Home, Search, Library, PlusCircle, Heart, Clock, Download } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Tab } from "./MobileBottomNav";
import { useI18n } from "../../contexts/I18nContext";
import { usePWA } from "../../contexts/PWAContext";

interface DesktopSidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  playlistCount: number;
}

export const DesktopSidebar = React.memo(function DesktopSidebar({
  activeTab,
  onTabChange,
  playlistCount,
}: DesktopSidebarProps) {
  const { t } = useI18n();
  const { isInstallable, isInstalled, isDismissed, promptInstall } = usePWA();

  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 flex-col justify-between border-r border-white/5 bg-background/50 backdrop-blur-xl h-screen sticky top-0 py-6 px-4">
      <div className="space-y-8">
        {/* Logo / Marka */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg shadow-primary/20 overflow-hidden relative">
            <Image src="/icon.png" alt="MuseFlow Logo" fill className="object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
              Studio
            </p>
            <p className="text-lg font-bold text-white tracking-tight">MuseFlow</p>
          </div>
        </div>

        {/* Ana Navigasyon */}
        <nav className="space-y-2">
          <button
            onClick={() => onTabChange("home")}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300",
              activeTab === "home"
                ? "bg-white/10 text-white"
                : "text-muted hover:text-white hover:bg-white/5"
            )}
          >
            <Home className="h-5 w-5" strokeWidth={activeTab === "home" ? 2.5 : 2} />
            {t("nav.home")}
          </button>
          
          <button
            onClick={() => onTabChange("explore")}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300",
              activeTab === "explore"
                ? "bg-white/10 text-white"
                : "text-muted hover:text-white hover:bg-white/5"
            )}
          >
            <Search className="h-5 w-5" strokeWidth={activeTab === "explore" ? 2.5 : 2} />
            {t("nav.explore")}
          </button>

          <button
            onClick={() => onTabChange("library")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300",
              activeTab === "library"
                ? "bg-white/10 text-white"
                : "text-muted hover:text-white hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-4">
              <Library className="h-5 w-5" strokeWidth={activeTab === "library" ? 2.5 : 2} />
              {t("nav.library")}
            </div>
            {playlistCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary font-bold">
                {playlistCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Alt bilgi kartı / Uygulama Yükle */}
      {isInstallable && !isInstalled && isDismissed ? (
        <div 
          onClick={promptInstall}
          className="rounded-2xl bg-gradient-to-br from-primary/10 to-transparent p-4 border border-primary/20 relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center gap-3 relative z-10">
            <Download className="h-5 w-5 text-primary" />
            <p className="font-bold text-white text-sm">{t("pwa.installApp")}</p>
          </div>
          <p className="mt-2 text-xs text-muted leading-relaxed relative z-10">
            {t("pwa.installBannerDesc")}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-white/5 to-transparent p-4 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
          <p className="font-semibold text-white text-sm">MuseFlow</p>
          <p className="mt-1 text-xs text-muted">
            {t("search.description")}
          </p>
        </div>
      )}
    </aside>
  );
});
