import type { BattleRuleset } from "@/domain/team/config/battleFormat";

type LooseRecord = Record<string, unknown>;

function getStringField(record: LooseRecord, key: string): string | undefined {
  const v = record[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export function getRulesetDisplayName(ruleset: BattleRuleset): string {
  const r = ruleset as unknown as LooseRecord;
  return (
    getStringField(r, "name") ??
    getStringField(r, "formatLabelEs") ??
    getStringField(r, "format") ??
    getStringField(r, "id") ??
    "OU"
  );
}

export function isVgcRuleset(ruleset: BattleRuleset): boolean {
  const display = getRulesetDisplayName(ruleset).toLowerCase();
  const r = ruleset as unknown as LooseRecord;
  const id = getStringField(r, "id")?.toLowerCase() ?? "";
  const format = getStringField(r, "format")?.toLowerCase() ?? "";
  const allowItemClause = r.allowItemClause;
  const hasItemClause =
    typeof allowItemClause === "boolean" ? allowItemClause : false;
  return (
    display.includes("vgc") ||
    id.includes("vgc") ||
    format.includes("vgc") ||
    hasItemClause === true
  );
}
