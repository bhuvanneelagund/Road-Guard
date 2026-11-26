import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 max-w-xl mx-auto rounded-2xl bg-[#0a1226] border border-rose-500/40 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Component Display Error</h3>
            <p className="text-xs text-slate-400 mt-1">
              An unexpected error occurred while rendering this view.
            </p>
          </div>
          {this.state.error && (
            <div className="p-3 rounded-lg bg-black/40 border border-rose-500/20 font-mono text-left text-[11px] text-rose-300 overflow-x-auto max-h-32">
              {this.state.error.toString()}
            </div>
          )}
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-[#1d63ff] text-white text-xs font-semibold hover:opacity-90 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-[#0d1830] border border-[#17284b] text-slate-300 text-xs font-semibold hover:text-white flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
