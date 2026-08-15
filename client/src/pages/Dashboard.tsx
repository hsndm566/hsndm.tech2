import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useAuth as useManusAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { SignInButton, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { isDashboardSubdomain } from "@/lib/subdomain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Search, Building2, MapPin, Briefcase, LogIn, LogOut, ShieldCheck, User, Settings, Calendar, Bell, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { SearchableSaudiSelect } from "@/components/SearchableSaudiSelect";
import { saudiCities, saudiIndustries } from "@/lib/saudiTaxonomy";
import { CandidateDashboardSkeleton } from "@/components/CandidateDashboardSkeleton";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const { user, isAuthenticated, logout, loading: authLoading } = useManusAuth();
  const clerkAuth = useClerkAuth();
  const clerkDashboardEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) && (isDashboardSubdomain() || window.location.pathname === "/dashboard");
  const dashboardAuthenticated = clerkDashboardEnabled ? Boolean(clerkAuth.isSignedIn) : isAuthenticated;
  const dashboardAuthLoading = clerkDashboardEnabled ? !clerkAuth.isLoaded : authLoading;
  const [clerkLoadTimedOut, setClerkLoadTimedOut] = useState(false);

  useEffect(() => {
    if (!clerkDashboardEnabled || clerkAuth.isLoaded) return;
    const timeoutId = window.setTimeout(() => setClerkLoadTimedOut(true), 8000);
    return () => window.clearTimeout(timeoutId);
  }, [clerkDashboardEnabled, clerkAuth.isLoaded]);

  const utils = trpc.useUtils();
  const { data: applications = [], isLoading: appsLoading } = trpc.campaign.applications.list.useQuery(undefined, {
    enabled: dashboardAuthenticated,
  });
  const { data: profile, isLoading: profileLoading } = trpc.campaign.applications.profile.get.useQuery(undefined, {
    enabled: dashboardAuthenticated,
  });

  const updateProfileMutation = trpc.campaign.applications.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Candidate profile updated successfully");
      utils.campaign.applications.profile.get.invalidate();
    },
    onError: () => {
      toast.error("Failed to update profile");
    }
  });

  const filteredApps = applications.filter((app) => {
    const matchesSearch = app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) || app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || app.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) || app.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (statusFilter === "all" || app.status === statusFilter);
  });

  const recentActivity = buildRecentActivity(applications, profile);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "interview":
        return <Badge className="bg-emerald-600 text-white">Interview Scheduled</Badge>;
      case "offer":
        return <Badge className="bg-blue-600 text-white">Offer Received</Badge>;
      case "applied":
        return <Badge className="bg-amber-600 text-white">Application Sent</Badge>;
      case "queued":
        return <Badge className="bg-zinc-600 text-white">Queued</Badge>;
      default:
        return <Badge className="bg-zinc-500 text-white">{status}</Badge>;
    }
  };

  if (clerkDashboardEnabled && !clerkAuth.isLoaded && !clerkLoadTimedOut) {
    return (
      <main className="min-h-screen bg-[#f3f0e9] text-[#151515] grid place-items-center p-6" aria-busy="true">
        <Loader2 className="h-7 w-7 animate-spin text-[#e5482a]" aria-label="Loading secure sign-in" />
      </main>
    );
  }

  if (clerkDashboardEnabled && clerkLoadTimedOut && !clerkAuth.isLoaded) {
    return (
      <main className="min-h-screen bg-[#f3f0e9] text-[#151515] grid place-items-center p-6">
        <Card className="w-full max-w-md border-[#151515]/10 bg-[#fbf9f5]">
          <CardHeader>
            <CardTitle>Sign-in is temporarily unavailable</CardTitle>
            <CardDescription>The secure email sign-in service did not respond. Please try again shortly.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a]" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (clerkDashboardEnabled && !clerkAuth.isSignedIn) {
    return (
      <main className="min-h-screen bg-[#f3f0e9] text-[#151515] grid place-items-center p-6">
        <Card className="w-full max-w-md border-[#151515]/10 bg-[#fbf9f5]">
          <CardHeader>
            <CardTitle>Private candidate dashboard</CardTitle>
            <CardDescription>Use your email to receive a secure passwordless sign-in link.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <Button className="w-full bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a]">Email me a sign-in link</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f0e9] text-[#151515] font-sans antialiased">
      <header className="border-b border-[#151515]/10 bg-[#fbf9f5] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 min-h-20 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full min-w-0 items-center gap-2 md:gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="shrink-0 gap-2 px-2 md:px-3">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Home</span><span className="sm:hidden">Home</span>
              </Button>
            </Link>
            <div className="h-6 w-px shrink-0 bg-[#151515]/10" />
            <h1 className="min-w-0 truncate text-base font-bold tracking-tight md:text-xl">Candidate Portal & Application Hub</h1>
          </div>
          <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
            {dashboardAuthLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#151515]/50" />
            ) : dashboardAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard/settings"><Button variant="outline" size="sm" className="gap-1.5" aria-label="Open profile settings"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Settings</span></Button></Link>
                <span className="min-w-0 max-w-[12rem] truncate text-sm font-medium flex items-center gap-1.5 bg-[#f3f0e9] px-3 py-1.5 rounded-full border border-[#151515]/10">
                  <User className="w-3.5 h-3.5 text-[#e5482a]" /> {user?.name || user?.email || "Candidate"}
                  {user?.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-blue-600 ml-1" />}
                </span>
                <Button variant="outline" size="sm" onClick={() => clerkDashboardEnabled ? clerkAuth.signOut() : logout()} className="gap-1.5">
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={() => startLogin()} className="bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a] gap-2">
                <LogIn className="w-4 h-4" /> Candidate Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {!dashboardAuthenticated ? (
          <Card className="bg-[#fbf9f5] border-[#151515]/10 text-center py-20 max-w-2xl mx-auto shadow-sm">
            <CardContent className="space-y-6">
              <Briefcase className="w-16 h-16 mx-auto text-[#e5482a]" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Sign in to view your personalized application feed</h2>
                <p className="text-sm text-[#151515]/70 max-w-md mx-auto">
                  AutoApply SA securely links your submitted applications to your candidate account so you can track interviews, offers, and active submissions in real time.
                </p>
              </div>
              <Button onClick={() => startLogin()} size="lg" className="bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a] gap-2">
                <LogIn className="w-5 h-5" /> Sign In with Manus
              </Button>
            </CardContent>
          </Card>
        ) : (
          appsLoading || profileLoading ? <CandidateDashboardSkeleton /> : <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription>Your Active Applications</CardDescription>
                  <CardTitle className="text-3xl font-mono">{applications.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription>Interviews & Offers</CardDescription>
                  <CardTitle className="text-3xl font-mono text-emerald-700">
                    {applications.filter(a => a.status === 'interview' || a.status === 'offer').length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription>Target City (Saudi)</CardDescription>
                  <CardTitle className="text-xl font-mono truncate">{profile?.targetCity || "Jeddah"}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm flex flex-col justify-center">
                <CardContent className="pt-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2 border-[#151515]/20">
                        <Settings className="w-4 h-4" /> Profile Preferences
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#fbf9f5] border-[#151515]/20">
                      <DialogHeader>
                        <DialogTitle>Candidate Profile & Preferences</DialogTitle>
                        <DialogDescription>Customize your Saudi Arabia job matching criteria and notification alerts.</DialogDescription>
                      </DialogHeader>
                      {profileLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
                      ) : (
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Target Saudi City</label>
                            <SearchableSaudiSelect options={saudiCities} value={profile?.targetCity || "Jeddah"} onChange={(val) => updateProfileMutation.mutate({ targetCity: val })} placeholder="Search Saudi cities…" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Target Industry</label>
                            <SearchableSaudiSelect options={saudiIndustries} value={profile?.targetIndustry || "Technology & Software"} onChange={(val) => updateProfileMutation.mutate({ targetIndustry: val })} placeholder="Search industries…" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Private resume reference</label>
                            <Input maxLength={255} defaultValue={profile?.resumeFileName || ""} placeholder="For example: Hasan-CV-August-2026.pdf" onBlur={(event) => updateProfileMutation.mutate({ resumeFileName: event.target.value })} />
                            <p className="text-xs text-[#151515]/60">Only this label and an optional short note are saved here. Your CV file and extracted text are never stored in this profile.</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">ATS follow-up note</label>
                            <Input maxLength={500} defaultValue={profile?.resumeSummary || ""} placeholder="For example: Asked for a human review of finance roles in Riyadh." onBlur={(event) => updateProfileMutation.mutate({ resumeSummary: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Salary Expectation</label>
                            <Select 
                              defaultValue={profile?.salaryExpectation || "15,000 - 25,000 SAR"}
                              onValueChange={(val) => updateProfileMutation.mutate({ salaryExpectation: val })}
                            >
                              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10,000 - 15,000 SAR">10,000 - 15,000 SAR</SelectItem>
                                <SelectItem value="15,000 - 25,000 SAR">15,000 - 25,000 SAR</SelectItem>
                                <SelectItem value="25,000 - 40,000 SAR">25,000 - 40,000 SAR</SelectItem>
                                <SelectItem value="40,000+ SAR">40,000+ SAR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-medium">WhatsApp Status Alerts</span>
                            <Switch 
                              defaultChecked={profile?.notifyWhatsApp ?? true}
                              onCheckedChange={(checked) => updateProfileMutation.mutate({ notifyWhatsApp: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Email Status Summaries</span>
                            <Switch 
                              defaultChecked={profile?.notifyEmail ?? true}
                              onCheckedChange={(checked) => updateProfileMutation.mutate({ notifyEmail: checked })}
                            />
                          </div>
                          <Link href="/enquire" className="inline-flex w-full items-center justify-center rounded-md bg-[#151515] px-4 py-2.5 text-sm font-medium text-[#fbf9f5] transition-colors hover:bg-[#e5482a]">Request a human ATS follow-up</Link>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Recent activity</CardTitle>
                    <CardDescription className="mt-1.5">Your latest application updates and campaign notifications.</CardDescription>
                  </div>
                  <Bell className="h-5 w-5 shrink-0 text-[#e5482a]" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="border-t border-[#151515]/10 pt-0">
                {recentActivity.length === 0 ? (
                  <div className="py-7 text-sm leading-6 text-[#151515]/60">No activity has been recorded yet. Your first application update will appear here.</div>
                ) : (
                  <ol className="divide-y divide-[#151515]/10">
                    {recentActivity.map((activity) => (
                      <li key={activity.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                        <div className="flex min-w-0 gap-3">
                          <span className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${activity.kind === "notification" ? "bg-[#151515]/8 text-[#151515]/65" : "bg-[#e5482a]/10 text-[#e5482a]"}`}>
                            {activity.kind === "notification" ? <Bell className="h-3.5 w-3.5" aria-hidden="true" /> : <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm leading-6 text-[#151515]">{activity.message}</p>
                            <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-[#151515]/45">{activity.detail}</p>
                          </div>
                        </div>
                        <time className="pl-10 font-mono text-[10px] leading-5 text-[#151515]/50 sm:pl-0">{formatActivityTime(activity.timestamp)}</time>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#151515]/40" />
                <Input
                  placeholder="Search by company or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#fbf9f5] border-[#151515]/20"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-52 bg-[#fbf9f5] border-[#151515]/20"><SelectValue placeholder="Filter status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="applied">Application sent</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="skipped">Not proceeding</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-[#151515]/60 flex items-center gap-3">
                <span>Showing {filteredApps.length} applications</span>
              </div>
            </div>

            {filteredApps.length === 0 ? (
              <Card className="bg-[#fbf9f5] border-[#151515]/10 text-center py-16">
                <CardContent className="space-y-4">
                  <Briefcase className="w-12 h-12 mx-auto text-[#151515]/30" />
                  <h3 className="text-lg font-semibold">No applications found in your account</h3>
                  <p className="text-sm text-[#151515]/60 max-w-md mx-auto">
                    You haven't submitted any campaign briefs yet, or your applications are currently being prepared by our Jeddah matching engine.
                  </p>
                  <Link href="/enquire">
                    <Button className="bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a]">
                      Start Application Campaign
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <Card 
                    key={app.id} 
                    className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
                    onClick={() => setSelectedApp(app)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-xs uppercase font-mono tracking-wider text-[#e5482a] font-semibold">{app.candidateName}</span>
                          <CardTitle className="text-lg mt-1">{app.roleTitle}</CardTitle>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      <CardDescription className="flex items-center gap-1.5 mt-2">
                        <Building2 className="w-3.5 h-3.5" /> {app.companyName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-[#151515]/70 border-t border-[#151515]/10 pt-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {app.city}, Saudi Arabia</span>
                        <span className="font-mono">{new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-[#e5482a] font-medium flex items-center justify-between pt-1">
                        <span>Click to view interactive timeline</span>
                        <span>→</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Application Timeline Dialog */}
            <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
              <DialogContent className="bg-[#fbf9f5] border-[#151515]/20 max-w-lg">
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs uppercase font-mono text-[#e5482a] font-semibold">{selectedApp?.companyName}</span>
                      <DialogTitle className="text-xl mt-1">{selectedApp?.roleTitle}</DialogTitle>
                    </div>
                    {selectedApp && getStatusBadge(selectedApp.status)}
                  </div>
                  <DialogDescription className="pt-2">
                    Application tracking timeline and submission milestones for {selectedApp?.city}, Saudi Arabia.
                  </DialogDescription>
                </DialogHeader>
                {selectedApp && (
                  <div className="space-y-6 py-4">
                    <div className="space-y-4 border-l-2 border-[#151515]/20 pl-4 ml-2">
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-[#fbf9f5]" />
                        <h4 className="text-sm font-semibold">CV Signal Intake & Matching</h4>
                        <p className="text-xs text-[#151515]/60">Matched against verified Saudi Arabia active hiring roles.</p>
                        <span className="text-[10px] font-mono text-[#151515]/40">{new Date(selectedApp.appliedAt).toLocaleString()}</span>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-[#fbf9f5]" />
                        <h4 className="text-sm font-semibold">Application Transmitted via {selectedApp.channel}</h4>
                        <p className="text-xs text-[#151515]/60">Successfully delivered to employer portal / hiring manager.</p>
                      </div>
                      <div className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${selectedApp.status === 'interview' || selectedApp.status === 'offer' ? 'bg-emerald-600' : 'bg-zinc-400'} ring-4 ring-[#fbf9f5]` } />
                        <h4 className="text-sm font-semibold">Hiring Manager Review & Response</h4>
                        <p className="text-xs text-[#151515]/60">
                          {selectedApp.status === 'interview' ? 'Interview scheduled by recruiter.' : selectedApp.status === 'offer' ? 'Official offer received!' : 'Awaiting recruiter feedback (typically 3-5 business days).'}
                        </p>
                      </div>
                    </div>
                    {selectedApp.notes && (
                      <div className="bg-[#f3f0e9] p-4 rounded-lg text-xs space-y-1">
                        <strong className="text-[#151515]">Campaign Manager Notes:</strong>
                        <p className="text-[#151515]/80">{selectedApp.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </main>
    </div>
  );
}

type ActivityItem = {
  id: string;
  kind: "application" | "notification";
  message: string;
  detail: string;
  timestamp: Date | string;
};

function buildRecentActivity(
  applications: Array<{ id: number; companyName: string; roleTitle: string; city?: string | null; status: string; appliedAt: Date | string; updatedAt?: Date | string; notes?: string | null }>,
  profile: { updatedAt?: Date | string | null } | null | undefined,
): ActivityItem[] {
  const statusMessages: Record<string, string> = {
    queued: "Application queued for review",
    applied: "Application sent",
    interview: "Interview update received",
    offer: "Offer update received",
    skipped: "Application marked not proceeding",
  };

  const items: ActivityItem[] = applications.flatMap((application) => {
    const base: ActivityItem = {
      id: `application-${application.id}`,
      kind: "application",
      message: `${statusMessages[application.status] || "Application status updated"}: ${application.roleTitle}`,
      detail: `${application.companyName} · ${application.city || "Saudi Arabia"}`,
      timestamp: application.updatedAt || application.appliedAt,
    };
    if (!application.notes) return [base];
    return [base, {
      id: `notification-${application.id}`,
      kind: "notification",
      message: "Campaign manager note added",
      detail: application.notes,
      timestamp: application.updatedAt || application.appliedAt,
    }];
  });

  if (profile?.updatedAt) {
    items.push({
      id: "profile-updated",
      kind: "notification",
      message: "Profile preferences updated",
      detail: "Your next campaign will use the latest settings",
      timestamp: profile.updatedAt,
    });
  }

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
}

function formatActivityTime(timestamp: Date | string) {
  return new Date(timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}
