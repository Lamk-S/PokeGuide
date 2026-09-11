import type { BattleResult } from "@/domain/battle/types/BattleTypes";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BattleResultCard({
  result: { damage, koAnalysis, explanation },
}: {
  result: BattleResult;
}) {
  return (
    <Card className="mt-8 overflow-hidden">
      <CardHeader className="bg-zinc-50 dark:bg-zinc-900">
        <CardDescription>{explanation.summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-3xl font-bold">
            {damage.minDamage} - {damage.maxDamage}{" "}
            <span className="text-lg font-medium text-zinc-600">
              ({damage.minPercent}% - {damage.maxPercent}%)
            </span>
          </p>
          <Badge variant={koAnalysis.guaranteed ? "default" : "secondary"}>
            {koAnalysis.guaranteed
              ? "Garantizado"
              : `${koAnalysis.probability}%`}{" "}
            ({koAnalysis.hitsToKO}HKO)
          </Badge>
        </div>
        <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900/50">
          {explanation.factors.map((f) => (
            <div key={f.label} className="text-sm">
              <b>{f.label}</b>: {f.description}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
