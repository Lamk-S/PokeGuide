export default function TeamBuilderLoading() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] p-6">
      <div className="max-w-[1600px] mx-auto space-y-3">
        <div className="h-10 w-full bg-white border border-[#EDE8E0]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {["slot-a", "slot-b", "slot-c", "slot-d", "slot-e", "slot-f"].map(
            (k) => (
              <div
                key={k}
                className="h-45 bg-white border border-[#EDE8E0] animate-pulse"
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
