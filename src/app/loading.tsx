export default function RootLoading() {
  return (
    <div className="min-h-70vh] bg-[#FFFEFB] p-6 animate-pulse">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="h-6 w-48 bg-[#EDE8E0] rounded" />
        <div className="h-17 w-full bg-white border border-[#EDE8E0] rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 h-130 bg-white border border-[#EDE8E0] rounded-xl" />
          <div className="lg:col-span-4 h-80 bg-white border border-[#EDE8E0] rounded-xl" />
          <div className="lg:col-span-4 h-130 bg-white border border-[#EDE8E0] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
