export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 border-b border-zinc-200 pb-4">
        <div className="h-7 w-48 rounded bg-zinc-200" />
        <div className="mt-2 h-4 w-96 rounded bg-zinc-100" />
      </div>
      <div className="grid gap-6 md:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <div className="h-10 rounded-lg bg-zinc-100" />
          <div className="h-105 rounded-xl bg-zinc-100" />
        </div>
        <div className="h-80 rounded-xl bg-zinc-100" />
      </div>
    </div>
  );
}
