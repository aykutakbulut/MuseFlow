"use client";

import { Home, Search, Library } from "lucide-react";
import { cn } from "../../lib/utils";
import { useI18n } from "../../contexts/I18nContext";

export type Tab = "home" | "explore" | "library";

interface MobileBottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; icon: React.ElementType }[] = [
  { id: "home", icon: Home },
  { id: "explore", icon: Search },
  { id: "library", icon: Library },
];

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const { t } = useI18n();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
      aria-label="Mobil navigasyon"
    >
      {/* Hafif gradient gölge ile premium his */}
      <div className="absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      
      {/* Blur arka plan */}
      <div className="bg-background/90 backdrop-blur-xl border-t border-white/5 pb-safe pt-1">
        <div className="flex items-center justify-around px-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const label = t(`nav.${tab.id}`);
            
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1.5 py-3 transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted hover:text-white"
                )}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-transform duration-300",
                      isActive ? "scale-110" : "scale-100"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className="text-[10px] font-medium tracking-wide">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
