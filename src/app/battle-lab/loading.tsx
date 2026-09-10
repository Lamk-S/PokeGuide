export default function BattleLabLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-100 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
