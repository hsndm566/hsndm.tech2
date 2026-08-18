import { Component, ReactNode } from "react";
import { RecoveryPanel } from "./RecoveryPanel";

interface Props {
  children: ReactNode;
  resetKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidUpdate(previousProps: Props) {
    if (this.state.hasError && this.props.resetKey !== previousProps.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return <RecoveryPanel arabic={typeof window !== "undefined" && window.location.pathname.startsWith("/ar")} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
