export default function BattleLabLoading() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] -mx-4 md:-mx-6 lg:-mx-8 -my-6 md:-my-8 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        <div className="h-11 w-full animate-pulse rounded-none bg-[#FFFEFB] border-y border-[#EDE8E0]" />
        <div className="h-17 w-full animate-pulse rounded-xl bg-[#FFFEFB] border border-[#EDE8E0]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 h-160 animate-pulse rounded-xl bg-[#FFFEFB] border border-[#EDE8E0]" />
          <div className="lg:col-span-4 h-160 animate-pulse rounded-xl bg-[#FFFEFB] border border-[#EDE8E0]" />
          <div className="lg:col-span-4 h-160 animate-pulse rounded-xl bg-[#FFFEFB] border border-[#EDE8E0]" />
        </div>
      </div>
    </div>
  );
}
