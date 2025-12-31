import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ClerkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Clerk Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
          <div className="max-w-md text-center space-y-6">
            <div className="inline-block p-4 rounded-full bg-red-500/10 border border-red-500/50 text-red-500 mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
            </div>
            <h1 className="text-2xl font-bold">Initialization Error</h1>
            <p className="text-slate-400">
              There was a problem initializing the authentication service. This is usually caused by an invalid Publishable Key.
            </p>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-left overflow-auto max-h-32">
                <code className="text-xs text-red-400 font-mono">
                    {this.state.error?.message || "Unknown error"}
                </code>
            </div>
            <button 
               onClick={() => {
                   this.setState({ hasError: false });
                   if (this.props.onReset) {
                     this.props.onReset();
                   }
               }}
               className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ClerkErrorBoundary;
