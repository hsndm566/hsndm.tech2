import React from "react";
import { Bell } from "lucide-react";

type ActivityPreview = {
  timestamp: Date | string;
};

type ActivityNotificationButtonProps = {
  activities: ActivityPreview[];
  seenAt: number;
  onSeen: () => void;
  targetId?: string;
};

export function ActivityNotificationButton({ activities, seenAt, onSeen, targetId = "recent-activity" }: ActivityNotificationButtonProps) {
  const unreadActivityCount = activities.filter((activity) => new Date(activity.timestamp).getTime() > seenAt).length;

  const handleClick = () => {
    onSeen();
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      className="relative inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#151515]/20 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-[#151515]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2"
      onClick={handleClick}
      aria-label={unreadActivityCount > 0 ? `View ${unreadActivityCount} new activity updates` : "View recent activity"}
    >
      <Bell className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Activity</span>
      {unreadActivityCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#e5482a] px-1 text-[10px] font-bold leading-4 text-white" aria-label={`${unreadActivityCount} new updates`}>
          {unreadActivityCount > 9 ? "9+" : unreadActivityCount}
        </span>
      )}
    </button>
  );
}
