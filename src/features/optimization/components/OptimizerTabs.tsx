"use client";
import { useActiveTab, useOptimizerActions } from "../store/useOptimizerStore";

export function OptimizerTabs() {
  const activeTab = useActiveTab();
  const { setActiveTab } = useOptimizerActions();
  return (
    <div className="flex rounded-lg border border-zinc-200 bg-zinc-100 p-1">
      <button
        type="button"
        onClick={() => setActiveTab("speed")}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === "speed" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-600 hover:text-zinc-900"}`}
      >
        Velocidad{" "}
        <span className="ml-2 text-[11px] tabular-nums text-zinc-400">
          O(log N)
        </span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("survival")}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === "survival" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-600 hover:text-zinc-900"}`}
      >
        Supervivencia{" "}
        <span className="ml-2 text-[11px] tabular-nums text-zinc-400">B&B</span>
      </button>
    </div>
  );
}
