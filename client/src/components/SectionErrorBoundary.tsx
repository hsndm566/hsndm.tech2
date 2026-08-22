import { Component, type ReactNode } from "react";
import { reportSectionError } from "@/lib/reportSectionError";

type Props = { children: ReactNode; fallback?: ReactNode; name: string };

export class SectionErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    reportSectionError(this.props.name, error);
  }

  render() {
    return this.state.hasError ? (this.props.fallback ?? null) : this.props.children;
  }
}
