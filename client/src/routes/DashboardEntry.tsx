import { ClerkDashboardShell } from "@/components/ClerkDashboardShell";
import Dashboard from "@/pages/Dashboard";
import ProfileSettings from "@/pages/ProfileSettings";
import { Route, Switch } from "wouter";

/** Dashboard-only route graph. Keeping it separate prevents Clerk from entering public startup. */
export default function DashboardEntry() {
  return (
    <ClerkDashboardShell>
      <Switch>
        <Route path="/dashboard/settings" component={ProfileSettings} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    </ClerkDashboardShell>
  );
}
