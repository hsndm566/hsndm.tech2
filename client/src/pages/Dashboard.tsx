import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Search, Building2, MapPin, Briefcase, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: applications = [], isLoading, refetch } = trpc.campaign.applications.list.useQuery();

  const filteredApps = applications.filter((app) => 
    app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-[#f3f0e9] text-[#151515] font-sans antialiased">
      <header className="border-b border-[#151515]/10 bg-[#fbf9f5] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-[#151515]/10" />
            <h1 className="text-xl font-bold tracking-tight">Candidate Dashboard & Application Hub</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh Feed
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Total Managed Applications</CardDescription>
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
              <CardDescription>Active Search Cities</CardDescription>
              <CardTitle className="text-3xl font-mono">Jeddah, Riyadh, Dammam</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#151515]/40" />
            <Input
              placeholder="Search by candidate, company, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#fbf9f5] border-[#151515]/20"
            />
          </div>
          <div className="text-sm text-[#151515]/60">
            Showing {filteredApps.length} of {applications.length} tracked applications
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#e5482a]" />
          </div>
        ) : filteredApps.length === 0 ? (
          <Card className="bg-[#fbf9f5] border-[#151515]/10 text-center py-16">
            <CardContent className="space-y-4">
              <Briefcase className="w-12 h-12 mx-auto text-[#151515]/30" />
              <h3 className="text-lg font-semibold">No applications recorded yet</h3>
              <p className="text-sm text-[#151515]/60 max-w-md mx-auto">
                Applications submitted through the AutoApply SA engine or logged by your campaign manager will appear here in real time.
              </p>
              <Link href="/enquire">
                <Button className="bg-[#151515] text-[#fbf9f5] hover:bg-[#e5482a]">
                  Start New Campaign
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <Card key={app.id} className="bg-[#fbf9f5] border-[#151515]/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
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
                  {app.notes && (
                    <div className="bg-[#f3f0e9] p-3 rounded text-xs text-[#151515]/80">
                      <strong>Notes:</strong> {app.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
