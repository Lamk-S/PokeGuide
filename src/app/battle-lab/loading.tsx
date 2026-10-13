export default function BattleLabLoading() {
  return (
    <div className="p-6 bg-[#FFFEFB] animate-pulse space-y-3 min-h-[70vh]">
      <div className="h-14 bg-white border border-[#EDE8E0] rounded-xl" />
      <div className="h-[68px] bg-white border border-[#EDE8E0] rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 h-[520px] bg-white border border-[#EDE8E0] rounded-xl" />
        <div className="lg:col-span-4 h-[320px] bg-white border border-[#EDE8E0] rounded-xl" />
        <div className="lg:col-span-4 h-[520px] bg-white border border-[#EDE8E0] rounded-xl" />
      </div>
    </div>
  );
}
