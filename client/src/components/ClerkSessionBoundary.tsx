import { ClerkProvider, useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { setClerkTokenGetter } from "@/lib/clerkToken";

type ClerkSession = {
  enabled: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  user: { primaryEmailAddress?: { emailAddress?: string | null } | null; fullName?: string | null } | null;
  signOut: () => Promise<void>;
};

const unavailableSession: ClerkSession = {
  enabled: false,
  isLoaded: true,
  isSignedIn: false,
  user: null,
  signOut: async () => undefined,
};

const ClerkSessionContext = createContext<ClerkSession>(unavailableSession);

function ClerkSessionBridge({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user } = useClerkUser();

  useEffect(() => {
    setClerkTokenGetter(() => getToken());
    return () => setClerkTokenGetter(null);
  }, [getToken]);

  return (
    <ClerkSessionContext.Provider value={{ enabled: true, isLoaded, isSignedIn: Boolean(isSignedIn), user: user ?? null, signOut }}>
      {children}
    </ClerkSessionContext.Provider>
  );
}

export function ClerkSessionBoundary({ enabled, publishableKey, children }: { enabled: boolean; publishableKey?: string; children: ReactNode }) {
  if (!enabled || !publishableKey) {
    return <ClerkSessionContext.Provider value={unavailableSession}>{children}</ClerkSessionContext.Provider>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkSessionBridge>{children}</ClerkSessionBridge>
    </ClerkProvider>
  );
}

export function useClerkSession() {
  return useContext(ClerkSessionContext);
}
