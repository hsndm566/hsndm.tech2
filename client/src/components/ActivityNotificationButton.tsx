import React from "react";
import { Bell, Check, ChevronDown, MoveRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatSafeDate, safeTimestampMs } from "@/lib/safeTimestamp";

type ActivityPreview = {
  id?: string;
  message?: string;
  detail?: string;
  timestamp: unknown;
};

type ActivityNotificationButtonProps = {
  activities: ActivityPreview[];
  seenAt: number;
  onSeen: () => void;
  targetId?: string;
};

function formatPreviewTime(timestamp: unknown) {
  return formatSafeDate(timestamp, { month: "short", day: "numeric" });
}

export function ActivityNotificationButton({ activities, seenAt, onSeen, targetId = "recent-activity" }: ActivityNotificationButtonProps) {
  const unreadActivityCount = activities.filter((activity) => safeTimestampMs(activity.timestamp) > seenAt).length;
  const latestActivities = activities.slice(0, 4);

  const openActivityFeed = () => {
    onSeen();
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const markPreviewSeen = () => {
    onSeen();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#151515]/20 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-[#151515]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2"
          aria-label={unreadActivityCount > 0 ? `View ${unreadActivityCount} new activity updates` : "View recent activity"}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Activity</span>
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          {unreadActivityCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#e5482a] px-1 text-[10px] font-bold leading-4 text-white" aria-label={`${unreadActivityCount} new updates`}>
              {unreadActivityCount > 9 ? "9+" : unreadActivityCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] border-[#151515]/15 bg-[#fbf9f5] p-2 text-[#151515]">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
          <span>Latest activity</span>
          {unreadActivityCount > 0 ? <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#e5482a]">{unreadActivityCount} new</span> : <span className="flex items-center gap-1 text-[10px] font-normal uppercase tracking-[0.12em] text-[#151515]/45"><Check className="h-3 w-3" /> Up to date</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#151515]/10" />
        {latestActivities.length === 0 ? (
          <div className="px-3 py-5 text-sm leading-5 text-[#151515]/60">No updates yet. Your application activity will appear here.</div>
        ) : (
          latestActivities.map((activity) => (
            <DropdownMenuItem key={activity.id || `${activity.message}-${activity.timestamp}`} onSelect={markPreviewSeen} className="items-start gap-3 rounded-lg px-3 py-3 focus:bg-[#151515]/5">
              <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${safeTimestampMs(activity.timestamp) > seenAt ? "bg-[#e5482a]/10 text-[#e5482a]" : "bg-[#151515]/8 text-[#151515]/60"}`}>
                <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{activity.message || "Activity update"}</span>
                <span className="mt-0.5 block truncate text-xs text-[#151515]/55">{activity.detail || "Your campaign has a new update."}</span>
              </span>
              <time className="shrink-0 pt-0.5 font-mono text-[10px] text-[#151515]/45">{formatPreviewTime(activity.timestamp)}</time>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator className="bg-[#151515]/10" />
        <DropdownMenuItem onSelect={openActivityFeed} className="justify-between rounded-lg px-3 py-2.5 font-medium text-[#e5482a] focus:bg-[#e5482a]/10 focus:text-[#e5482a]">
          View full activity feed <MoveRight className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
