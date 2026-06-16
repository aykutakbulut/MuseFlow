"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Hata gösterildiğinde kullanılacak özel fallback. Verilmezse varsayılan hata ekranı. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary — yakalanan render hatalarını kullanıcıya gösterir
 * ve konsola detaylı şekilde loglar.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      "[ErrorBoundary] Yakalanmamış hata:",
      error,
      "\nComponent stack:",
      info.componentStack,
      "\nTimestamp:",
      new Date().toISOString(),
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-red-950/30 p-8 text-center shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-8 w-8 text-red-400"
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <h1 className="text-lg font-bold text-red-300">Beklenmeyen Bir Hata Oluştu</h1>
            <p className="mt-2 text-sm leading-relaxed text-red-400/80">
              {this.state.error?.message ?? "Bir şeyler ters gitti. Sayfayı yenilemek sorunu çözebilir."}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Yeniden Dene
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-700/80 bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
