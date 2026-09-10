import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GCap Global Error Caught:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">ऐप रिफ्रेश आवश्यक है</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              ऐप को सुचारु रूप से चलाने के लिए कृपया नीचे दिए गए बटन पर क्लिक करें। आपका वॉलेट और निवेश डेटा पूरी तरह सुरक्षित है।
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ऐप पुनः लोड करें (Reload App)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
