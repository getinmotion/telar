import { Skeleton } from "@/components/ui/skeleton";

export const ActionCardSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-background p-6 shadow-neumorphic transition-all hover:shadow-neumorphic-hover">
      <div className="flex flex-col gap-4">
        {/* Badge and icon */}
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-16 w-16 rounded-2xl" />
        </div>

        {/* Title and subtitle */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Progress bar (optional) */}
        <div className="space-y-2">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Metadata rows */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* CTA button */}
        <div className="flex justify-end pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
