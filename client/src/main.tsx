import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import App from "./App";
import { installErrorTelemetry } from "./lib/errorTelemetry";
import "./index.css";

installErrorTelemetry();
const DataClientProviders = lazy(() => import("./components/DataClientProviders").then(module => ({ default: module.DataClientProviders })));
const publicHomepageRoutes = new Set(["/", "/ar"]);

function ApplicationBootstrap() {
  const [location] = useLocation();

  if (publicHomepageRoutes.has(location)) return <App />;

  return (
    <Suspense fallback={null}>
      <DataClientProviders><App /></DataClientProviders>
    </Suspense>
  );
}

createRoot(document.getElementById("root")!).render(
  <ApplicationBootstrap />,
);
