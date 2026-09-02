import React from 'react';

// Catches render/lifecycle errors anywhere below it in the tree and shows a
// fallback instead of letting React unmount the whole app to a blank page.
// Class component because error boundaries have no hook equivalent.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-accent px-4">
          <div className="bg-white rounded-2xl shadow-modern-lg p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2 font-fraunces">
              Something went wrong
            </h1>
            <p className="text-text-light mb-6 font-inter">
              This page hit an unexpected error. Try reloading, or head back to the homepage.
            </p>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
