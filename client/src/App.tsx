/**
 * Design reminder — Operational Clarity: routes should keep every interaction in a clear,
 * legible service journey, including recovery states and enquiry completion.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
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
const CampaignStatus = lazy(() => import("@/pages/CampaignStatus"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ProfileSettings = lazy(() => import("@/pages/ProfileSettings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ThankYou = lazy(() => import("@/pages/ThankYou"));
const Ats = lazy(() => import("@/pages/Ats"));
const InformationPage = lazy(() => import("@/pages/InformationPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
import { useLocation } from "wouter";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { setClerkTokenGetter } from "@/lib/clerkToken";
import { isDashboardSubdomain } from "@/lib/subdomain";
import { CookieConsent } from "@/components/CookieConsent";
import { WhatsAppBusinessCta } from "@/components/WhatsAppBusinessCta";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

function ClerkTokenBridge() {
  const { getToken } = useClerkAuth();

  useEffect(() => {
    setClerkTokenGetter(() => getToken());
    return () => setClerkTokenGetter(null);
  }, [getToken]);

  return null;
}

function ClerkProtectedRoute({ children }: { children: ReactNode }) {
  if (!clerkPublishableKey) return <>{children}</>;
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ClerkTokenBridge />
      {children}
    </ClerkProvider>
  );
}

function Router() {
  const [location, setLocation] = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isDashboardSubdomain() && location !== "/dashboard" && location !== "/dashboard/settings") {
        setLocation("/dashboard");
        return;
      }
      if (location === "/") {
        const hasVisited = sessionStorage.getItem("autoapply_lang_routed");
        const preferredLocale = document.cookie.split("; ").find((entry) => entry.startsWith("autoapply_preferred_locale="))?.split("=")[1];
        if (!hasVisited && (preferredLocale === "ar" || (!preferredLocale && navigator.language && navigator.language.startsWith("ar")))) {
          sessionStorage.setItem("autoapply_lang_routed", "true");
          setLocation("/ar");
        }
      }
    }
  }, [location, setLocation]);

  return (
    <Switch>
      {isDashboardSubdomain() ? (
        <>
          <Route path="/dashboard/settings" component={() => <ClerkProtectedRoute><ProfileSettings /></ClerkProtectedRoute>} />
          <Route path="/dashboard" component={() => <ClerkProtectedRoute><Dashboard /></ClerkProtectedRoute>} />
        </>
      ) : null}
      <Route path="/" component={Home} />
      <Route path="/ar" component={ArabicHome} />
      <Route path="/ar/enquire" component={ArabicEnquire} />
      <Route path="/ar/thank-you" component={ArabicThankYou} />
      <Route path="/enquire" component={Enquire} />
      <Route path="/campaign/:campaignId" component={CampaignStatus} />
      <Route path="/dashboard/settings" component={() => <ClerkProtectedRoute><ProfileSettings /></ClerkProtectedRoute>} />
      <Route path="/dashboard" component={() => <ClerkProtectedRoute><Dashboard /></ClerkProtectedRoute>} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/ats" component={Ats} />
      <Route path="/pricing" component={() => <PricingPage />} />
      <Route path="/services" component={() => <ServicesPage />} />
      <Route path="/ar/pricing" component={() => <PricingPage language="ar" />} />
      <Route path="/ar/services" component={() => <ServicesPage language="ar" />} />
      <Route path="/how-it-works" component={() => <InformationPage kind="how" />} />
      <Route path="/support" component={() => <InformationPage kind="support" />} />
      <Route path="/case-studies" component={() => <InformationPage kind="case" />} />
      <Route path="/privacy" component={() => <InformationPage kind="privacy" />} />
      <Route path="/terms" component={() => <InformationPage kind="terms" />} />
      <Route path="/ar/how-it-works" component={() => <InformationPage kind="how" language="ar" />} />
      <Route path="/ar/support" component={() => <InformationPage kind="support" language="ar" />} />
      <Route path="/ar/case-studies" component={() => <InformationPage kind="case" language="ar" />} />
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
          <CookieConsent />
          <WhatsAppBusinessCta />
          <Suspense fallback={<main className="min-h-screen bg-[#f3f0e9]" aria-busy="true" />}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
