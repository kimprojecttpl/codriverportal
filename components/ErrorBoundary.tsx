"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg shadow-sm p-6 text-center">
            <div className="text-4xl mb-3">💥</div>
            <h2 className="text-base font-semibold text-slate-900">เกิดข้อผิดพลาด</h2>
            <p className="text-xs text-slate-500 mb-4">Something went wrong</p>
            <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-md px-3 py-2 text-left font-mono break-words mb-4">
              {this.state.error.message}
            </div>
            <button
              onClick={this.reset}
              className="h-9 px-4 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-md"
            >
              ลองอีกครั้ง / Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
