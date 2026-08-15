import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { SignInButton, useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/clerk-react";
import { useAuth as useManusAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { isDashboardSubdomain } from "@/lib/subdomain";
import { SearchableSaudiSelect } from "@/components/SearchableSaudiSelect";
import { saudiCities, saudiIndustries } from "@/lib/saudiTaxonomy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, LogIn, LogOut, Save, Settings2, UserRound } from "lucide-react";
import { toast } from "sonner";

type ProfileDraft = {
  fullName: string;
  phone: string;
  preferredSeniority: "Entry level" | "Mid-level" | "Senior" | "Leadership";
  preferredLanguage: "English" | "Arabic";
  openToRemote: boolean;
  targetCity: string;
  targetIndustry: string;
  salaryExpectation: string;
  notifyWhatsApp: boolean;
  notifyEmail: boolean;
};

const defaultDraft: ProfileDraft = {
  fullName: "",
  phone: "",
  preferredSeniority: "Mid-level",
  preferredLanguage: "English",
  openToRemote: false,
  targetCity: "Jeddah",
  targetIndustry: "Technology & Engineering",
  salaryExpectation: "15,000 - 25,000 SAR",
  notifyWhatsApp: true,
  notifyEmail: true,
};

type ProfileSource = {
  fullName?: string | null;
  phone?: string | null;
  preferredSeniority?: string | null;
  preferredLanguage?: string | null;
  openToRemote?: boolean | null;
  targetCity?: string | null;
  targetIndustry?: string | null;
  salaryExpectation?: string | null;
  notifyWhatsApp?: boolean | null;
  notifyEmail?: boolean | null;
};

function draftFromProfile(profile: ProfileSource | null | undefined): ProfileDraft {
  return {
    fullName: profile?.fullName ?? "",
    phone: profile?.phone ?? "",
    preferredSeniority: (profile?.preferredSeniority as ProfileDraft["preferredSeniority"]) || defaultDraft.preferredSeniority,
    preferredLanguage: (profile?.preferredLanguage as ProfileDraft["preferredLanguage"]) || defaultDraft.preferredLanguage,
    openToRemote: profile?.openToRemote ?? defaultDraft.openToRemote,
    targetCity: profile?.targetCity || defaultDraft.targetCity,
    targetIndustry: profile?.targetIndustry || defaultDraft.targetIndustry,
    salaryExpectation: profile?.salaryExpectation || defaultDraft.salaryExpectation,
    notifyWhatsApp: profile?.notifyWhatsApp ?? defaultDraft.notifyWhatsApp,
    notifyEmail: profile?.notifyEmail ?? defaultDraft.notifyEmail,
  };
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile settings">
      <Skeleton className="h-9 w-56 bg-[#151515]/10" />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-xl border border-[#151515]/10 bg-[#fbf9f5] p-6 shadow-sm space-y-5">
          <Skeleton className="h-6 w-48 bg-[#151515]/10" />
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-10 w-full bg-[#151515]/10" />)}
        </div>
        <div className="rounded-xl border border-[#151515]/10 bg-[#fbf9f5] p-6 shadow-sm space-y-5">
          <Skeleton className="h-6 w-48 bg-[#151515]/10" />
          {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-10 w-full bg-[#151515]/10" />)}
        </div>
      </div>
    </div>
  );
}

export default function ProfileSettings() {
  const { user, isAuthenticated, logout, loading: authLoading } = useManusAuth();
  const clerkAuth = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const clerkDashboardEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) && (isDashboardSubdomain() || window.location.pathname.startsWith("/dashboard"));
  const dashboardAuthenticated = clerkDashboardEnabled ? Boolean(clerkAuth.isSignedIn) : isAuthenticated;
  const [clerkLoadTimedOut, setClerkLoadTimedOut] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(defaultDraft);
  const previousDraftRef = useRef<ProfileDraft | null>(null);

  useEffect(() => {
    if (!clerkDashboardEnabled || clerkAuth.isLoaded) return;
    const timeoutId = window.setTimeout(() => setClerkLoadTimedOut(true), 8000);
    return () => window.clearTimeout(timeoutId);
  }, [clerkDashboardEnabled, clerkAuth.isLoaded]);

  const { data: profile, isLoading: profileLoading } = trpc.campaign.applications.profile.get.useQuery(undefined, { enabled: dashboardAuthenticated });
  const utils = trpc.useUtils();
  const updateProfileMutation = trpc.campaign.applications.profile.update.useMutation({
    onSuccess: async () => {
      await utils.campaign.applications.profile.get.invalidate();
      const previousDraft = previousDraftRef.current;
      previousDraftRef.current = null;
      toast.success("Save Changes successful", {
        description: "Your candidate preferences are now updated.",
        action: previousDraft ? {
          label: "Undo",
          onClick: () => {
            setDraft(previousDraft);
            previousDraftRef.current = null;
            updateProfileMutation.mutate(previousDraft);
          },
        } : undefined,
      });
    },
    onError: () => toast.error("We could not save your profile settings. Please try again."),
  });

  useEffect(() => {
    if (!profile) return;
    setDraft(draftFromProfile(profile));
  }, [profile]);

  const setField = <K extends keyof ProfileDraft>(field: K, value: ProfileDraft[K]) => setDraft((current) => ({ ...current, [field]: value }));

  if (clerkDashboardEnabled && !clerkAuth.isLoaded && !clerkLoadTimedOut) {
    return <main className="min-h-screen bg-[#f3f0e9] p-6" aria-busy="true"><SettingsSkeleton /></main>;
  }

  if (clerkDashboardEnabled && clerkLoadTimedOut && !clerkAuth.isLoaded) {
    return (
      <main className="min-h-screen bg-[#f3f0e9] grid place-items-center p-6">
        <Card className="w-full max-w-md border-[#151515]/10 bg-[#fbf9f5]"><CardHeader><CardTitle>Sign-in is temporarily unavailable</CardTitle><CardDescription>The secure email sign-in service did not respond. Please try again shortly.</CardDescription></CardHeader><CardContent><Button className="w-full bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a]" onClick={() => window.location.reload()}>Try again</Button></CardContent></Card>
      </main>
    );
  }

  if (clerkDashboardEnabled && !clerkAuth.isSignedIn) {
    return (
      <main className="min-h-screen bg-[#f3f0e9] grid place-items-center p-6">
        <Card className="w-full max-w-md border-[#151515]/10 bg-[#fbf9f5]"><CardHeader><CardTitle>Private candidate settings</CardTitle><CardDescription>Use your email to receive a secure passwordless sign-in link.</CardDescription></CardHeader><CardContent><SignInButton mode="modal" fallbackRedirectUrl="/dashboard/settings"><Button className="w-full bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a]">Email me a sign-in link</Button></SignInButton></CardContent></Card>
      </main>
    );
  }

  if (dashboardAuthLoading(authLoading, clerkDashboardEnabled, clerkAuth.isLoaded)) {
    return <main className="min-h-screen bg-[#f3f0e9] p-6"><SettingsSkeleton /></main>;
  }

  if (!dashboardAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f3f0e9] grid place-items-center p-6">
        <Card className="w-full max-w-md border-[#151515]/10 bg-[#fbf9f5] text-center"><CardHeader><CardTitle>Sign in to edit your profile</CardTitle><CardDescription>Your preferences are private and only visible to your candidate account.</CardDescription></CardHeader><CardContent><Button onClick={() => startLogin()} className="w-full bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a] gap-2"><LogIn className="h-4 w-4" /> Candidate Sign In</Button></CardContent></Card>
      </main>
    );
  }

  const accountLabel = clerkDashboardEnabled ? clerkUser?.primaryEmailAddress?.emailAddress : user?.email;

  return (
    <div className="min-h-screen bg-[#f3f0e9] text-[#151515] font-sans antialiased">
      <header className="sticky top-0 z-30 border-b border-[#151515]/10 bg-[#fbf9f5]">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard"><Button variant="ghost" size="sm" className="gap-2 px-2"><ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to dashboard</span><span className="sm:hidden">Dashboard</span></Button></Link>
            <div className="h-6 w-px bg-[#151515]/10" />
            <div className="min-w-0"><p className="truncate text-base font-bold tracking-tight md:text-xl">Profile settings</p><p className="truncate text-xs text-[#151515]/55">{accountLabel || "Private candidate account"}</p></div>
          </div>
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <span className="hidden items-center gap-2 rounded-full border border-[#151515]/10 bg-[#f3f0e9] px-3 py-1.5 text-sm font-medium sm:flex"><UserRound className="h-3.5 w-3.5 text-[#e5482a]" /> {user?.name || clerkUser?.fullName || "Candidate"}</span>
            <Button variant="outline" size="sm" onClick={() => clerkDashboardEnabled ? clerkAuth.signOut() : logout()} className="gap-1.5"><LogOut className="h-4 w-4" /> Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 md:py-10">
        <div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#151515] text-[#fbf9f5]"><Settings2 className="h-5 w-5" /></div><div><h1 className="text-2xl font-bold tracking-tight md:text-3xl">Personalise your campaign</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-[#151515]/65">Keep your contact details and Saudi Arabia job preferences current so every campaign is aligned with what you want next.</p></div></div>

        {profileLoading ? <SettingsSkeleton /> : (
          <form onSubmit={(event) => { event.preventDefault(); previousDraftRef.current = draftFromProfile(profile); updateProfileMutation.mutate(draft); }} className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="border-[#151515]/10 bg-[#fbf9f5] shadow-sm"><CardHeader><CardTitle>Personal information</CardTitle><CardDescription>These details help the team identify your campaign and contact you when something needs your attention.</CardDescription></CardHeader><CardContent className="space-y-5">
              <div className="space-y-2"><label htmlFor="full-name" className="text-sm font-medium">Full name</label><Input id="full-name" value={draft.fullName} onChange={(event) => setField("fullName", event.target.value)} maxLength={120} placeholder="Your name" /></div>
              <div className="space-y-2"><label htmlFor="phone" className="text-sm font-medium">Phone number</label><Input id="phone" type="tel" value={draft.phone} onChange={(event) => setField("phone", event.target.value)} maxLength={64} placeholder="+966 5X XXX XXXX" /><p className="text-xs leading-5 text-[#151515]/55">Use a Saudi or international format that can receive WhatsApp updates.</p></div>
              <div className="space-y-2"><label className="text-sm font-medium">Preferred update language</label><Select value={draft.preferredLanguage} onValueChange={(value) => setField("preferredLanguage", value as ProfileDraft["preferredLanguage"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Arabic">العربية</SelectItem></SelectContent></Select></div>
              <div className="rounded-lg border border-[#151515]/10 bg-[#f3f0e9] p-4 text-xs leading-5 text-[#151515]/65">Your CV file and extracted CV text are not stored in these settings. This page only saves the personal labels and preferences you choose.</div>
            </CardContent></Card>

            <Card className="border-[#151515]/10 bg-[#fbf9f5] shadow-sm"><CardHeader><CardTitle>Job matching preferences</CardTitle><CardDescription>Fine-tune the Saudi roles and alerts you want the engine to prioritise.</CardDescription></CardHeader><CardContent className="space-y-5">
              <div className="space-y-2"><label className="text-sm font-medium">Target Saudi city</label><SearchableSaudiSelect options={saudiCities} value={draft.targetCity} onChange={(value) => setField("targetCity", value)} placeholder="Search Saudi cities…" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Target industry</label><SearchableSaudiSelect options={saudiIndustries} value={draft.targetIndustry} onChange={(value) => setField("targetIndustry", value)} placeholder="Search industries…" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Seniority</label><Select value={draft.preferredSeniority} onValueChange={(value) => setField("preferredSeniority", value as ProfileDraft["preferredSeniority"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Entry level">Entry level</SelectItem><SelectItem value="Mid-level">Mid-level</SelectItem><SelectItem value="Senior">Senior</SelectItem><SelectItem value="Leadership">Leadership</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Salary expectation</label><Select value={draft.salaryExpectation} onValueChange={(value) => setField("salaryExpectation", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10,000 - 15,000 SAR">10,000 - 15,000 SAR</SelectItem><SelectItem value="15,000 - 25,000 SAR">15,000 - 25,000 SAR</SelectItem><SelectItem value="25,000 - 40,000 SAR">25,000 - 40,000 SAR</SelectItem><SelectItem value="40,000+ SAR">40,000+ SAR</SelectItem></SelectContent></Select></div>
              <div className="flex items-center justify-between gap-4 border-t border-[#151515]/10 pt-4"><div><p className="text-sm font-medium">Open to remote roles</p><p className="text-xs text-[#151515]/55">Keep Saudi-based roles as the primary focus.</p></div><Switch checked={draft.openToRemote} onCheckedChange={(value) => setField("openToRemote", value)} /></div>
              <div className="flex items-center justify-between gap-4"><span className="text-sm font-medium">WhatsApp status alerts</span><Switch checked={draft.notifyWhatsApp} onCheckedChange={(value) => setField("notifyWhatsApp", value)} /></div>
              <div className="flex items-center justify-between gap-4"><span className="text-sm font-medium">Email status summaries</span><Switch checked={draft.notifyEmail} onCheckedChange={(value) => setField("notifyEmail", value)} /></div>
            </CardContent></Card>

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-[#151515]/55">Changes apply to your next campaign. You can return here at any time.</p><Button type="submit" disabled={updateProfileMutation.isPending} className="gap-2 bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a]">{updateProfileMutation.isPending ? "Saving…" : <><Save className="h-4 w-4" /> Save Changes</>}</Button></div>
          </form>
        )}
      </main>
    </div>
  );
}

function dashboardAuthLoading(authLoading: boolean, clerkDashboardEnabled: boolean, clerkIsLoaded: boolean) {
  return clerkDashboardEnabled ? !clerkIsLoaded : authLoading;
}
