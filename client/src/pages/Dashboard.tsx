import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useAuth as useManusAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { SignInButton } from "@clerk/clerk-react";
import { isDashboardSubdomain } from "@/lib/subdomain";
import { useClerkSession } from "@/components/ClerkSessionBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, ArrowLeft, Search, Building2, MapPin, Briefcase, LogIn, LogOut, ShieldCheck, User, Settings, ArrowUpDown, Calendar, Clock, PlusCircle, Pencil, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { SearchableSaudiSelect } from "@/components/SearchableSaudiSelect";
import { saudiCities, saudiIndustries } from "@/lib/saudiTaxonomy";
import { CandidateDashboardSkeleton } from "@/components/CandidateDashboardSkeleton";
import { ActivityNotificationButton } from "@/components/ActivityNotificationButton";
import { FirstLoginDashboard } from "@/components/FirstLoginDashboard";
import { CampaignEvidenceGuide } from "@/components/CampaignEvidenceGuide";
import { CampaignPlanSummary } from "@/components/CampaignPlanSummary";
import { CampaignActionCenter } from "@/components/CampaignActionCenter";
import { CampaignManagementBoard } from "@/components/CampaignManagementBoard";
import { formatSafeDate, formatSafeDateTime, safeTimestampMs, toActivityTimestamp } from "@/lib/safeTimestamp";
import { captureClientReliabilitySignal } from "@/lib/sentryTelemetry";

function evidenceLabel(type: "portal_confirmation" | "email_accepted" | "employer_confirmation") {
  if (type === "portal_confirmation") return "Portal confirmation";
  if (type === "email_accepted") return "Email accepted";
  return "Employer confirmation";
}

function buildRecentActivity(applications: any[], profile: any) {
  const items: Array<{ id: string; title: string; description: string; timestamp: string; type: "status" | "note" | "profile" }> = [];
  for (const app of applications) {
    items.push({
      id: `app-applied-${app.id}`,
      title: `${app.roleTitle} at ${app.companyName}`,
      description: `Application submitted for ${app.city}, Saudi Arabia`,
      timestamp: toActivityTimestamp(app.appliedAt, app.createdAt),
      type: "status",
    });
    const updatedTimestamp = toActivityTimestamp(app.updatedAt, app.createdAt);
    if (updatedTimestamp && updatedTimestamp !== toActivityTimestamp(app.appliedAt, app.createdAt)) {
      items.push({
        id: `app-updated-${app.id}`,
        title: `Status updated: ${app.roleTitle}`,
        description: `Current milestone: ${app.status.toUpperCase()}`,
        timestamp: updatedTimestamp,
        type: "status",
      });
    }
  }
  if (profile?.updatedAt) {
    items.push({
      id: `profile-update-${profile.updatedAt}`,
      title: "Profile preferences saved",
      description: `Target city: ${profile.targetCity || "Jeddah"}, Industry: ${profile.targetIndustry || "General"}`,
      timestamp: toActivityTimestamp(profile.updatedAt, profile.createdAt),
      type: "profile",
    });
  }
  return items.sort((a, b) => safeTimestampMs(b.timestamp) - safeTimestampMs(a.timestamp));
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "company" | "role">("newest");
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCity, setNewCity] = useState("Jeddah");
  const [newStatus, setNewStatus] = useState("applied");
  const [newNotes, setNewNotes] = useState("");
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCity, setEditCity] = useState("Jeddah");
  const [editStatus, setEditStatus] = useState("applied");
  const [editNotes, setEditNotes] = useState("");

  const [activitySeenAt, setActivitySeenAt] = useState<number>(() => {
    try {
      return Number(window.localStorage.getItem("autoapply_activity_seen_at") || 0);
    } catch {
      return 0;
    }
  });
  const { user, isAuthenticated, logout, loading: authLoading } = useManusAuth();
  const clerkAuth = useClerkSession();
  const clerkDashboardEnabled = clerkAuth.enabled && (isDashboardSubdomain() || window.location.pathname === "/dashboard");
  const dashboardAuthenticated = clerkDashboardEnabled ? Boolean(clerkAuth.isSignedIn) : isAuthenticated;
  const dashboardAuthLoading = clerkDashboardEnabled ? !clerkAuth.isLoaded : authLoading;
  const candidateIdentity = clerkDashboardEnabled
    ? {
        name: clerkAuth.user?.fullName?.trim() || "Candidate",
        email: clerkAuth.user?.primaryEmailAddress?.emailAddress || "",
      }
    : {
        name: user?.name || "Candidate",
        email: user?.email || "",
      };
  const [clerkLoadTimedOut, setClerkLoadTimedOut] = useState(false);
  const dashboardHelpMessage = encodeURIComponent("Hi AutoApply SA — I need help accessing my candidate dashboard or requesting a secure campaign report.");
  const dashboardPauseMessage = encodeURIComponent("Hi AutoApply SA — I need to pause my campaign. Please confirm when the pause is effective. مرحباً AutoApply SA — أرغب في إيقاف حملتي. يرجى تأكيد وقت سريان الإيقاف.");

  useEffect(() => {
    if (!clerkDashboardEnabled || clerkAuth.isLoaded) return;
    // The candidate portal must not leave visitors on an unexplained spinner.
    // If Clerk has not initialized within eight seconds, switch to a safe,
    // non-data-bearing recovery path rather than guessing the session state.
    const timeoutId = window.setTimeout(() => setClerkLoadTimedOut(true), 8_000);
    return () => window.clearTimeout(timeoutId);
  }, [clerkDashboardEnabled, clerkAuth.isLoaded]);

  useEffect(() => {
    if (clerkLoadTimedOut) {
      captureClientReliabilitySignal("clerk_load_timeout", "Candidate dashboard sign-in did not initialize within the bounded recovery window.");
    }
  }, [clerkLoadTimedOut]);

  const utils = trpc.useUtils();
  const { data: applications = [], isLoading: appsLoading, isError: appsError } = trpc.campaign.applications.list.useQuery(undefined, {
    enabled: dashboardAuthenticated,
  });
  const { data: profile, isLoading: profileLoading, isError: profileError } = trpc.campaign.applications.profile.get.useQuery(undefined, {
    enabled: dashboardAuthenticated,
  });
  const { data: evidence = [], isLoading: evidenceLoading, isError: evidenceError } = trpc.campaign.applications.evidence.list.useQuery(undefined, {
    enabled: dashboardAuthenticated,
  });
  const { data: campaignApproval, isLoading: approvalLoading, isError: approvalError } = trpc.campaign.approval.get.useQuery(undefined, {
    enabled: dashboardAuthenticated,
  });
  const evidenceByApplicationId = new Map(evidence.map((item) => [item.applicationId, item]));

  const campaignApprovalMutation = trpc.campaign.approval.confirm.useMutation({
    onSuccess: () => {
      toast.success("Targeting plan saved for review");
      utils.campaign.approval.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Could not save your targeting plan");
    },
  });

  const updateProfileMutation = trpc.campaign.applications.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Candidate profile updated successfully");
      utils.campaign.applications.profile.get.invalidate();
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const createAppMutation = trpc.campaign.applications.create.useMutation({
    onSuccess: () => {
      toast.success("New job application added successfully");
      setIsNewAppOpen(false);
      setNewCompany("");
      setNewRole("");
      setNewNotes("");
      utils.campaign.applications.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add application");
    },
  });

  const updateAppMutation = trpc.campaign.applications.update.useMutation({
    onMutate: async (input) => {
      await utils.campaign.applications.list.cancel();
      const previous = utils.campaign.applications.list.getData();
      utils.campaign.applications.list.setData(undefined, (current) => current?.map((application) =>
        application.id === input.id ? { ...application, ...input, updatedAt: new Date() } : application
      ));
      return { previous };
    },
    onSuccess: () => {
      toast.success("Application updated successfully");
      setEditingApp(null);
    },
    onError: (error, _input, context) => {
      utils.campaign.applications.list.setData(undefined, context?.previous);
      toast.error(error.message || "Unable to update this application");
    },
    onSettled: () => utils.campaign.applications.list.invalidate(),
  });

  const deleteAppMutation = trpc.campaign.applications.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.campaign.applications.list.cancel();
      const previous = utils.campaign.applications.list.getData();
      utils.campaign.applications.list.setData(undefined, (current) => current?.filter((application) => application.id !== id));
      return { previous };
    },
    onSuccess: () => {
      toast.success("Application deleted");
      setDeleteTarget(null);
    },
    onError: (error, _input, context) => {
      utils.campaign.applications.list.setData(undefined, context?.previous);
      toast.error(error.message || "Unable to delete this application");
    },
    onSettled: () => utils.campaign.applications.list.invalidate(),
  });

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) {
      toast.error("Please enter both company name and role title");
      return;
    }
    createAppMutation.mutate({
      candidateName: candidateIdentity.name,
      candidateEmail: candidateIdentity.email,
      companyName: newCompany.trim(),
      roleTitle: newRole.trim(),
      city: newCity,
      status: newStatus as any,
      notes: newNotes.trim() || undefined,
    });
  };

  const openEditDialog = (application: any) => {
    setEditingApp(application);
    setEditCompany(application.companyName || "");
    setEditRole(application.roleTitle || "");
    setEditCity(application.city || "Jeddah");
    setEditStatus(application.status || "applied");
    setEditNotes(application.notes || "");
    setSelectedApp(null);
  };

  const handleEditApp = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingApp || !editCompany.trim() || !editRole.trim()) {
      toast.error("Please enter both company name and role title");
      return;
    }
    updateAppMutation.mutate({
      id: editingApp.id,
      companyName: editCompany.trim(),
      roleTitle: editRole.trim(),
      city: editCity,
      status: editStatus as "queued" | "applied" | "interview" | "offer" | "skipped",
      notes: editNotes.trim() || null,
    });
  };

  const openDeleteDialog = (application: any) => {
    setDeleteTarget(application);
    setSelectedApp(null);
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch = app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) || app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || app.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) || app.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (statusFilter === "all" || app.status === statusFilter);
  }).sort((a, b) => {
    if (sortBy === "newest") {
      return safeTimestampMs(b.appliedAt) - safeTimestampMs(a.appliedAt);
    }
    if (sortBy === "oldest") {
      return safeTimestampMs(a.appliedAt) - safeTimestampMs(b.appliedAt);
    }
    if (sortBy === "company") {
      return a.companyName.localeCompare(b.companyName);
    }
    if (sortBy === "role") {
      return a.roleTitle.localeCompare(b.roleTitle);
    }
    return 0;
  });

  const recentActivity = buildRecentActivity(applications, profile);
  const unreadActivityCount = recentActivity.filter((activity) => safeTimestampMs(activity.timestamp) > activitySeenAt).length;
  const markActivitySeen = () => {
    const seenAt = Date.now();
    setActivitySeenAt(seenAt);
    try {
      window.localStorage.setItem("autoapply_activity_seen_at", String(seenAt));
    } catch {
      // Local storage may be unavailable in private browsing; the in-memory state still works.
    }
  };

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
        <Card className="w-full max-w-lg border-[#151515]/10 bg-[#fbf9f5] shadow-sm">
          <CardHeader>
            <div className="mb-3 flex items-center gap-3 text-[#e5482a]"><Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" /><span className="font-mono text-[11px] uppercase tracking-[.12em]">Secure candidate access</span></div>
            <CardTitle>Connecting your private dashboard</CardTitle>
            <CardDescription>We are checking your secure sign-in session. No campaign records, CV files, or application actions are exposed while this connection is loading.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#151515]/65">If this takes longer than a few seconds, a safe recovery option will appear automatically.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (clerkDashboardEnabled && clerkLoadTimedOut && !clerkAuth.isLoaded) {
    return (
      <main className="min-h-screen bg-[#f3f0e9] text-[#151515] grid place-items-center p-6">
        <Card className="w-full max-w-md border-[#151515]/10 bg-[#fbf9f5]">
          <CardHeader>
            <p className="font-mono text-[11px] uppercase tracking-[.12em] text-[#e5482a]">Secure access recovery</p>
            <CardTitle>Sign-in is temporarily unavailable</CardTitle>
            <CardDescription>The secure email sign-in service did not respond within eight seconds. Your campaign data remains protected and no application activity has been changed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a]" onClick={() => window.location.reload()}>
              Try again
            </Button>
            <a className="flex w-full items-center justify-center gap-2 border border-[#151515]/20 px-4 py-3 text-sm font-medium transition-colors hover:border-[#e5482a] hover:text-[#e5482a]" href={`https://wa.me/966571448656?text=${dashboardHelpMessage}`} target="_blank" rel="noreferrer">
              Request secure report help
            </a>
            <a className="flex w-full items-center justify-center gap-2 border border-[#e5482a] bg-[#fff8f6] px-4 py-3 text-sm font-medium text-[#9c2f1e] transition-colors hover:bg-[#fff0eb]" href={`https://wa.me/966571448656?text=${dashboardPauseMessage}`} target="_blank" rel="noreferrer">
              Pause my campaign urgently / أوقف حملتي بشكل عاجل
            </a>
            <a className="block text-center text-sm underline underline-offset-4" href="/campaign-report-sample">See how application evidence is recorded</a>
            <p className="text-xs leading-5 text-[#151515]/60">For privacy, we do not display a report link on this public recovery screen. The team confirms your identity before sharing any campaign update or confirming that a campaign pause is effective.</p>
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

  if (dashboardAuthenticated && (appsError || profileError || evidenceError || approvalError)) {
    return (
      <main className="min-h-screen bg-[#f3f0e9] text-[#151515] grid place-items-center p-6">
        <Card className="w-full max-w-md border-[#151515]/10 bg-[#fbf9f5]">
          <CardHeader>
            <TriangleAlert className="mb-2 h-6 w-6 text-[#e5482a]" aria-hidden="true" />
            <CardTitle>We could not load your campaign data</CardTitle>
            <CardDescription>Your data has not been changed. Please try again before relying on the activity shown here.</CardDescription>
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

  if (dashboardAuthenticated && !appsLoading && !profileLoading && !evidenceLoading && !approvalLoading && applications.length === 0) {
    const fullName = clerkDashboardEnabled ? clerkAuth.user?.fullName : user?.name;
    const email = clerkDashboardEnabled ? clerkAuth.user?.primaryEmailAddress?.emailAddress : user?.email;
    return (
      <FirstLoginDashboard
        identity={{ fullName, email }}
        onSignOut={() => { void (clerkDashboardEnabled ? clerkAuth.signOut() : logout()); }}
        approval={campaignApproval ?? undefined}
        approvalLoading={approvalLoading}
        approvalPending={campaignApprovalMutation.isPending}
        profileDefaults={{
          targetCity: profile?.targetCity || "Jeddah",
          targetIndustry: profile?.targetIndustry || "Technology & Engineering",
          seniority: (profile?.preferredSeniority || "Mid-level") as "Entry level" | "Mid-level" | "Senior" | "Leadership",
          preferredLanguage: (profile?.preferredLanguage || "English") as "English" | "Arabic",
          openToRemote: profile?.openToRemote || false,
        }}
        onConfirmCampaignApproval={(draft) => campaignApprovalMutation.mutate(draft)}
      />
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
                <ActivityNotificationButton activities={recentActivity} seenAt={activitySeenAt} onSeen={markActivitySeen} />
                <Link href="/dashboard/settings"><Button variant="outline" size="sm" className="gap-1.5" aria-label="Open profile settings"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Settings</span></Button></Link>
                <span className="min-w-0 max-w-[12rem] truncate text-sm font-medium flex items-center gap-1.5 bg-[#f3f0e9] px-3 py-1.5 rounded-full border border-[#151515]/10">
                  <User className="w-3.5 h-3.5 text-[#e5482a]" /> {candidateIdentity.name || candidateIdentity.email || "Candidate"}
                  {user?.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-blue-600 ml-1" />}
                </span>
                <Button variant="outline" size="sm" onClick={() => clerkDashboardEnabled ? clerkAuth.signOut() : logout()} className="gap-1.5">
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={() => startLogin()} size="sm" className="bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a] gap-2">
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {!dashboardAuthenticated && !dashboardAuthLoading ? (
          <Card className="bg-[#fbf9f5] border-[#151515]/10 text-center py-16">
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
          appsLoading || profileLoading || evidenceLoading || approvalLoading ? <CandidateDashboardSkeleton /> : <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Application Tracking & Feed</h2>
                <p className="text-sm text-[#151515]/70">Track automated submissions and manually added job entries across Saudi Arabia.</p>
              </div>
              <Dialog open={isNewAppOpen} onOpenChange={setIsNewAppOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a] gap-2 shrink-0">
                    <PlusCircle className="w-4 h-4" /> New Application
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#fbf9f5] border-[#151515]/20 max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Job Application</DialogTitle>
                    <DialogDescription>Manually track a target job submission or interview in your candidate portal.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateApp} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Name *</label>
                      <Input
                        required
                        placeholder="e.g. Aramco, SABIC, STC"
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        className="bg-white border-[#151515]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role Title *</label>
                      <Input
                        required
                        placeholder="e.g. Senior Software Engineer"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="bg-white border-[#151515]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Saudi City</label>
                      <Select value={newCity} onValueChange={setNewCity}>
                        <SelectTrigger className="bg-white border-[#151515]/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {saudiCities.map(c => (
                            <SelectItem key={c.en} value={c.en}>{c.en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Initial Status</label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="bg-white border-[#151515]/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="queued">Queued</SelectItem>
                          <SelectItem value="applied">Application sent</SelectItem>
                          <SelectItem value="interview">Interview scheduled</SelectItem>
                          <SelectItem value="offer">Offer received</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notes / Follow-up</label>
                      <Input
                        placeholder="Optional note about this job entry"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        className="bg-white border-[#151515]/20"
                      />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsNewAppOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={createAppMutation.isPending} className="bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a]">
                        {createAppMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Save Application
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={!!editingApp} onOpenChange={(open) => !open && setEditingApp(null)}>
              <DialogContent className="bg-[#fbf9f5] border-[#151515]/20 max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Job Application</DialogTitle>
                  <DialogDescription>Update the status, details, or follow-up note for this job entry.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditApp} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="edit-company">Company Name *</label>
                    <Input id="edit-company" required value={editCompany} onChange={(event) => setEditCompany(event.target.value)} className="bg-white border-[#151515]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="edit-role">Role Title *</label>
                    <Input id="edit-role" required value={editRole} onChange={(event) => setEditRole(event.target.value)} className="bg-white border-[#151515]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Saudi City</label>
                    <Select value={editCity} onValueChange={setEditCity}>
                      <SelectTrigger className="bg-white border-[#151515]/20"><SelectValue /></SelectTrigger>
                      <SelectContent>{saudiCities.map((city) => <SelectItem key={city.en} value={city.en}>{city.en}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Application Status</label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger className="bg-white border-[#151515]/20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="queued">Queued</SelectItem>
                        <SelectItem value="applied">Application sent</SelectItem>
                        <SelectItem value="interview">Interview scheduled</SelectItem>
                        <SelectItem value="offer">Offer received</SelectItem>
                        <SelectItem value="skipped">Not proceeding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="edit-notes">Notes / Follow-up</label>
                    <Input id="edit-notes" value={editNotes} onChange={(event) => setEditNotes(event.target.value)} placeholder="Optional note about this job entry" className="bg-white border-[#151515]/20" />
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setEditingApp(null)}>Cancel</Button>
                    <Button type="submit" disabled={updateAppMutation.isPending} className="bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a]">
                      {updateAppMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Save changes
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
              <AlertDialogContent className="bg-[#fbf9f5] border-[#151515]/20">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the {deleteTarget?.roleTitle} entry at {deleteTarget?.companyName} from your dashboard. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteAppMutation.isPending}>Keep application</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteTarget && deleteAppMutation.mutate({ id: deleteTarget.id })} disabled={deleteAppMutation.isPending} className="bg-red-700 text-white hover:bg-red-800">
                    {deleteAppMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Delete application
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription>Tracking records</CardDescription>
                  <CardTitle className="text-3xl font-mono">{applications.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription>Verified application evidence</CardDescription>
                  <CardTitle className="text-3xl font-mono text-emerald-700">
                    {evidence.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription>Interviews & offers</CardDescription>
                  <CardTitle className="text-3xl font-mono text-emerald-700">{applications.filter(a => a.status === 'interview' || a.status === 'offer').length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm flex flex-col justify-center">
                <CardContent className="pt-6">
                  <p className="mb-3 text-xs text-[#151515]/60">Target city: <span className="font-medium text-[#151515]">{profile?.targetCity || "Jeddah"}</span></p>
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
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>

            <CampaignPlanSummary approval={campaignApproval} profile={profile} />

            <CampaignActionCenter
              applicationStatuses={applications.map((application) => application.status)}
              hasCandidateApproval={Boolean(campaignApproval?.authorizationConfirmed)}
              verifiedEvidenceCount={evidence.length}
            />

            <CampaignManagementBoard
              applications={applications}
              hasCandidateApproval={Boolean(campaignApproval?.authorizationConfirmed)}
              verifiedEvidenceCount={evidence.length}
            />

            {/* Evidence guide and campaign launch status */}
            <CampaignEvidenceGuide
              hasCandidateApproval={Boolean(campaignApproval?.authorizationConfirmed)}
              verifiedEvidenceCount={evidence.length}
            />

            {/* Recent Activity Feed Card */}
            <Card className="border-[#151515]/10 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Evidence boundary</CardTitle>
                    <CardDescription className="mt-1.5 max-w-3xl leading-6">A tracking record helps you organize a role. A verified record is counted only after the AutoApply SA team records a portal confirmation, accepted email, or employer confirmation. We do not use activity notes as proof that an application was sent.</CardDescription>
                  </div>
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#e5482a]" aria-hidden="true" />
                </div>
              </CardHeader>
            </Card>

            {/* Recent Activity Feed Card */}
            <Card id="recent-activity" className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm scroll-mt-24">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#151515]/10">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#e5482a]" /> Recent Activity & Notification Log
                  </CardTitle>
                  <CardDescription>Live application updates, manager notes, and profile timestamps.</CardDescription>
                </div>
                {recentActivity.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={markActivitySeen} className="text-xs text-[#151515]/70 hover:text-[#151515]">
                    Mark all as read
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-[#151515]/60 text-center py-6">No recent activity recorded yet.</p>
                ) : (
                  <ol className="relative border-l border-[#151515]/10 ml-3 space-y-6">
                    {recentActivity.slice(0, 5).map((item) => {
                      const isUnread = safeTimestampMs(item.timestamp) > activitySeenAt;
                      return (
                        <li key={item.id} className="pl-6 relative">
                          <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-[#fbf9f5] ${isUnread ? 'bg-[#e5482a]' : 'bg-[#151515]/40'}`} />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              {item.title}
                              {isUnread && <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#e5482a]/10 text-[#e5482a]">New</span>}
                            </h4>
                            <span className="text-xs font-mono text-[#151515]/60 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatSafeDateTime(item.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-[#151515]/70 mt-1">{item.description}</p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#151515]/40" />
                <Input
                  placeholder="Search by company or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#fbf9f5] border-[#151515]/20"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-[#fbf9f5] border-[#151515]/20"><SelectValue placeholder="Filter status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="applied">Application sent</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="skipped">Not proceeding</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-full sm:w-48 bg-[#fbf9f5] border-[#151515]/20 gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#151515]/50" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="company">Company name</SelectItem>
                    <SelectItem value="role">Role title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(app.status)}
                          <Badge variant="outline" className={evidenceByApplicationId.has(app.id) ? "border-emerald-700/30 bg-emerald-50 text-emerald-800" : "border-[#151515]/15 bg-[#151515]/5 text-[#151515]/65"}>
                            {evidenceByApplicationId.has(app.id) ? `Verified · ${evidenceLabel(evidenceByApplicationId.get(app.id)!.evidenceType)}` : "Tracking record"}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-1.5 mt-2">
                        <Building2 className="w-3.5 h-3.5" /> {app.companyName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-[#151515]/70 border-t border-[#151515]/10 pt-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {app.city}, Saudi Arabia</span>
                        <span className="font-mono">{formatSafeDate(app.appliedAt)}</span>
                      </div>
                      <div className="text-xs text-[#e5482a] font-medium flex items-center justify-between pt-1">
                        <span>Click to view interactive timeline</span>
                        <span>→</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1" onClick={(event) => event.stopPropagation()}>
                        <Button type="button" size="sm" variant="outline" className="flex-1 gap-1.5 border-[#151515]/20" onClick={() => openEditDialog(app)} aria-label={`Edit ${app.roleTitle} at ${app.companyName}`}>
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="border-red-700/30 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => openDeleteDialog(app)} aria-label={`Delete ${app.roleTitle} at ${app.companyName}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#151515]/60">Submission Milestones</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#151515]/10">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <div className="flex-1">
                            <p className="font-medium">Application Dispatched</p>
                            <p className="text-xs text-[#151515]/60">{new Date(selectedApp.appliedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#151515]/10">
                          <span className={`w-2 h-2 rounded-full ${selectedApp.status === 'interview' || selectedApp.status === 'offer' ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                          <div className="flex-1">
                            <p className="font-medium">Status: {selectedApp.status.toUpperCase()}</p>
                            <p className="text-xs text-[#151515]/60">Last updated by hiring manager</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedApp.notes && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-[#151515]/60">Manager Note</h4>
                        <p className="text-sm bg-white p-3 rounded-lg border border-[#151515]/10 text-[#151515]/80">{selectedApp.notes}</p>
                      </div>
                    )}
                    <div className="pt-2 flex flex-wrap justify-end gap-2">
                      <Button variant="outline" onClick={() => openEditDialog(selectedApp)} className="gap-1.5"><Pencil className="w-4 h-4" /> Edit</Button>
                      <Button variant="outline" onClick={() => openDeleteDialog(selectedApp)} className="gap-1.5 border-red-700/30 text-red-700 hover:bg-red-50 hover:text-red-800"><Trash2 className="w-4 h-4" /> Delete</Button>
                      <Button variant="outline" onClick={() => setSelectedApp(null)}>Close</Button>
                    </div>
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
