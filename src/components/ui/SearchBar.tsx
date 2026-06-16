"use client";

import React from "react";
import { Search, Info } from "lucide-react";
import { useI18n } from "../../contexts/I18nContext";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  minQueryLength?: number;
  status: "idle" | "loading" | "error" | "success";
  hasResults: boolean;
}

export const SearchBar = React.memo(function SearchBar({
  value,
  onChange,
  minQueryLength = 2,
  status,
  hasResults,
}: SearchBarProps) {
  const { t } = useI18n();

  return (
    <header className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl text-white">
          {t("search.title")}
        </h1>
        <p className="max-w-xl text-base text-muted">
          {t("search.description")}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl bg-surface/40 p-4 border border-white/5 sm:flex-row sm:items-center sm:justify-between sm:p-5 backdrop-blur-xl shadow-2xl">
        {/* Arama girişi */}
        <div className="w-full sm:max-w-xl">
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted group-focus-within:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <input
              id="search"
              type="text"
              spellCheck="false"
              autoComplete="off"
              placeholder={t("search.placeholder")}
              className="block w-full rounded-2xl border border-white/10 bg-black/50 py-3.5 pl-12 pr-4 text-sm font-medium text-white outline-none transition-all placeholder:text-muted focus:border-primary/50 focus:bg-black/80 focus:shadow-[0_0_20px_rgba(var(--primary),0.2)]"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-muted flex items-center gap-1.5 pl-1">
            <Info className="h-3.5 w-3.5" /> {t("search.hint")}
          </p>
        </div>

      </div>
    </header>
  );
});
