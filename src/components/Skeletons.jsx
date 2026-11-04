// Skeleton placeholders shown briefly while "loading" content.
export function EventCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-[16/10] !rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-3 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton mt-4 h-10 w-full" />
      </div>
    </div>
  );
}

export function ClubCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton h-24 !rounded-none" />
      <div className="space-y-3 p-5 pt-10">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, Item = EventCardSkeleton }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}
