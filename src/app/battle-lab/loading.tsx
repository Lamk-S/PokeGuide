export default function BattleLabLoading() {
  return (
    <div className="p-6 bg-[#FFFEFB] animate-pulse space-y-3">
      <div className="h-14 bg-white border border-[#EDE8E0] rounded" />
      <div className="h-17 bg-white border border-[#EDE8E0]" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-96 bg-white border" />
        <div className="h-96 bg-white border" />
        <div className="h-96 bg-white border" />
      </div>
    </div>
  );
}
