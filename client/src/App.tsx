/**
 * Design reminder — Operational Clarity: routes should keep every interaction in a clear,
 * legible service journey, including recovery states and enquiry completion.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import "./updates.css";
import "./saudi-experience.css";

const ArabicHome = lazy(() => import("@/pages/ArabicHome"));
const ArabicEnquire = lazy(() => import("@/pages/ArabicEnquire"));
const ArabicThankYou = lazy(() => import("@/pages/ArabicThankYou"));
const Enquire = lazy(() => import("@/pages/Enquire"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ThankYou = lazy(() => import("@/pages/ThankYou"));
const Ats = lazy(() => import("@/pages/Ats"));
const InformationPage = lazy(() => import("@/pages/InformationPage"));
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ar" component={ArabicHome} />
      <Route path="/ar/enquire" component={ArabicEnquire} />
      <Route path="/ar/thank-you" component={ArabicThankYou} />
      <Route path="/enquire" component={Enquire} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/ats" component={Ats} />
      <Route path="/how-it-works" component={() => <InformationPage kind="how" />} />
      <Route path="/support" component={() => <InformationPage kind="support" />} />
      <Route path="/privacy" component={() => <InformationPage kind="privacy" />} />
      <Route path="/terms" component={() => <InformationPage kind="terms" />} />
      <Route path="/ar/how-it-works" component={() => <InformationPage kind="how" language="ar" />} />
      <Route path="/ar/support" component={() => <InformationPage kind="support" language="ar" />} />
      <Route path="/ar/privacy" component={() => <InformationPage kind="privacy" language="ar" />} />
      <Route path="/ar/terms" component={() => <InformationPage kind="terms" language="ar" />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Suspense fallback={<main className="min-h-screen bg-[#f3f0e9]" aria-busy="true" />}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
