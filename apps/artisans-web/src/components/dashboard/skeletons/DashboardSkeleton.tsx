import { RotatingLoadingPhrases } from "@/components/ui/RotatingLoadingPhrases";
import { HeroSkeleton } from "./HeroSkeleton";
import { ActionCardSkeleton } from "./ActionCardSkeleton";
import { MissionCardSkeleton } from "./MissionCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-cream animate-in fade-in duration-300">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section Skeleton */}
        <HeroSkeleton />

        {/* Action Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ActionCardSkeleton key={i} />
          ))}
        </div>

        {/* Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Fixed Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <MissionCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Chat Skeleton */}
            <div className="rounded-2xl bg-background p-6 shadow-neumorphic">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-10 w-full mt-4 rounded-lg" />
            </div>

            {/* Rewards Skeleton */}
            <div className="rounded-2xl bg-background p-6 shadow-neumorphic">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Phrases */}
        <div className="flex justify-center py-8">
          <RotatingLoadingPhrases 
            className="text-muted-foreground text-base"
            intervalMs={3000}
          />
        </div>
      </div>
    </div>
  );
};
