import { Skeleton } from "@/components/ui/skeleton";

export function CandidateDashboardSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading candidate dashboard" aria-busy="true">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-[#151515]/10 bg-[#fbf9f5] p-6 shadow-sm">
            <Skeleton className="h-3 w-28 bg-[#151515]/10" />
            <Skeleton className="mt-4 h-9 w-20 bg-[#151515]/10" />
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Skeleton className="h-10 w-full bg-[#151515]/10 md:max-w-sm" />
            <Skeleton className="h-10 w-full bg-[#151515]/10 md:w-52" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-[#151515]/10 bg-[#fbf9f5] p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-24 bg-[#151515]/10" />
                    <Skeleton className="h-6 w-40 bg-[#151515]/10" />
                    <Skeleton className="h-4 w-32 bg-[#151515]/10" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full bg-[#151515]/10" />
                </div>
                <Skeleton className="mt-8 h-3 w-full bg-[#151515]/10" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#151515]/10 bg-[#fbf9f5] p-6 shadow-sm">
          <Skeleton className="h-6 w-36 bg-[#151515]/10" />
          <Skeleton className="mt-3 h-4 w-56 bg-[#151515]/10" />
          <div className="mt-7 space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[12px_1fr] gap-3">
                <Skeleton className="mt-1 h-3 w-3 rounded-full bg-[#e5482a]/30" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-[#151515]/10" />
                  <Skeleton className="h-3 w-24 bg-[#151515]/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
