export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin`}
      />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-[#0f172a] rounded-t-lg">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 skeleton rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-[#334155]"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 skeleton rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
      <div className="space-y-3">
        <div className="h-4 w-1/3 skeleton rounded" />
        <div className="h-8 w-1/2 skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
      </div>
    </div>
  );
}
