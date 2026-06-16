"use client";

import { X, Download } from "lucide-react";
import { usePWA } from "../../contexts/PWAContext";
import { useI18n } from "../../contexts/I18nContext";

export function InstallBanner() {
  const { isInstallable, isInstalled, isDismissed, promptInstall, dismissInstall } = usePWA();
  const { t } = useI18n();

  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-surface/90 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-sky-500/20 text-2xl group-hover:scale-105 transition-transform">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold text-white mb-0.5">
            {t("pwa.installBannerTitle")}
          </p>
          <p className="text-xs text-muted line-clamp-2 leading-relaxed">
            {t("pwa.installBannerDesc")}
          </p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={promptInstall}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            {t("pwa.installButton")}
          </button>
        </div>
        <button
          onClick={dismissInstall}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-surface text-muted hover:text-white transition-colors"
          aria-label={t("pwa.close")}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
