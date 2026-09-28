import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Scavenger hunt boundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#060B14] text-[#F4F7FF] text-center select-none font-sans">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-[#E8C56A] flex items-center justify-center text-[#E8C56A] mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-lg font-serif font-bold text-[#FFE7A8] mb-2 tracking-wide">
            Living Glass Reliquary Notice
          </h2>
          <p className="text-xs text-slate-300 max-w-sm mb-6 leading-relaxed">
            The magical lens encountered a temporary rendering hiccup. Your collected tokens and hunt progress are safely saved!
          </p>
          <div className="p-3 bg-black/60 border border-[#E8C56A]/30 rounded-xl text-left max-w-sm w-full mb-6 font-mono text-[11px] text-amber-300/80 overflow-auto max-h-24">
            {this.state.error?.message || 'Unknown WebGL / AR Lens error'}
          </div>
          <button
            onClick={this.handleReset}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#E8C56A] via-[#FFE7A8] to-[#E8C56A] text-[#060B14] font-serif text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition"
          >
            <RefreshCw size={15} />
            <span>Resume Hunt</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
