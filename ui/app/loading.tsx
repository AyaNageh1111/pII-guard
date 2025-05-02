export default function Loading() {
  return (
    <div className="min-h-screen bg-background/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background/80 p-8 rounded-lg shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}