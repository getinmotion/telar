import { Skeleton } from "@/components/ui/skeleton";

export const MissionCardSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-background p-6 shadow-neumorphic transition-all">
      <div className="flex items-center gap-4">
        {/* Icon container */}
        <Skeleton className="h-20 w-20 flex-shrink-0 rounded-2xl" />

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Badge */}
          <Skeleton className="h-5 w-32 rounded-full" />
          
          {/* Title */}
          <Skeleton className="h-6 w-3/4" />
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Time estimate */}
          <Skeleton className="h-3 w-24" />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  );
};
