"use client";

import React from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav, type Tab } from "./MobileBottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  playlistCount: number;
}

export function MainLayout({
  children,
  activeTab,
  onTabChange,
  playlistCount,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      {/* Masaüstü Sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        playlistCount={playlistCount}
      />

      {/* Ana İçerik Alanı */}
      <main className="flex-1 min-w-0 w-full max-w-7xl mx-auto pb-36 md:pb-24 px-4 sm:px-6 lg:px-8 pt-4 md:pt-0">
        {children}
      </main>

      {/* Mobil Alt Navigasyon */}
      <MobileBottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
