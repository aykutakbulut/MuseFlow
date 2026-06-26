import { ChevronRight } from "lucide-react";
import React from "react";

interface HorizontalListProps {
  title: string;
  onViewAll?: () => void;
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  /** localStorage'dan henüz hidrasyon tamamlanmadıysa true — boş mesajı
   * yerine iskelet gösterip "henüz içerik yok" yanlış-pozitifini önler. */
  isLoading?: boolean;
}

export function HorizontalList({ title, onViewAll, children, emptyMessage, isEmpty, isLoading }: HorizontalListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-muted hover:text-white flex items-center transition-colors"
          >
            Tümü <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 w-40 flex-shrink-0 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center mx-1">
          <p className="text-muted">{emptyMessage || "Henüz içerik yok."}</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 custom-scrollbar snap-x snap-mandatory">
          {React.Children.map(children, (child) => (
            <div className="snap-start">{child}</div>
          ))}
        </div>
      )}
    </section>
  );
}
