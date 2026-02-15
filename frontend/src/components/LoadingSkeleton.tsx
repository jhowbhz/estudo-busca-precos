interface LoadingSkeletonProps {
  count?: number
}

export default function LoadingSkeleton({ count = 9 }: LoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-100 rounded-lg p-3 animate-pulse"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-3" />
          <div className="h-3 bg-gray-100 rounded w-16 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
          <div className="h-3 bg-gray-100 rounded w-3/4 mb-3" />
          <div className="h-5 bg-gray-100 rounded w-28" />
        </div>
      ))}
    </div>
  )
}
