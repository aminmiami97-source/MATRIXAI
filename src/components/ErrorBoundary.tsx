import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { MatrixIcon } from './MatrixIcon.tsx';

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
    console.error('matrixAI Uncaught Error Boundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearCacheAndReload = () => {
    try {
      // Clear potentially corrupted session data while preserving basic keys
      sessionStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070B14] text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black">
          <div className="max-w-md w-full p-6 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#0A0E1A] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,229,255,0.15)] text-center space-y-5">
            <div className="flex justify-center">
              <div className="relative">
                <MatrixIcon size="lg" glow={true} />
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-slate-950 shadow-md">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs">
                <span>Safe Mode Recovery</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">System Encountered an Anomaly</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                matrixAI isolated a runtime exception to preserve session integrity. You can instantly reload or reset cache below.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-red-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload System</span>
              </button>

              <button
                onClick={this.handleClearCacheAndReload}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs transition-all active:scale-95"
                title="Clear temporary session memory"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
