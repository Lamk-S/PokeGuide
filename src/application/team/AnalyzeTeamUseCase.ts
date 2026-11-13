import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import { OffensiveAnalyzer } from "@/domain/team/services/analyzers/OffensiveAnalyzer";
import type { TeamMember } from "@/domain/team/types/TeamTypes";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";

interface ResolvedMove {
  readonly id: string;
  readonly name?: string;
}

function getMoveIds(members: readonly TeamMember[]): string[] {
  const ids: string[] = [];
  for (const member of members) {
    const moves = (
      member as unknown as { moves?: readonly (string | ResolvedMove)[] }
    ).moves;
    if (!moves) continue;
    for (const m of moves) {
      if (typeof m === "string" && m.trim()) ids.push(m.toLowerCase().trim());
      else if (
        m &&
        typeof m === "object" &&
        "id" in m &&
        typeof (m as ResolvedMove).id === "string"
      ) {
        ids.push((m as ResolvedMove).id.toLowerCase().trim());
      }
    }
  }
  return [...new Set(ids)];
}

export interface TeamAnalysis {
  readonly offensiveCoverage: ReturnType<typeof OffensiveAnalyzer.analyze>;
  readonly teamSize: number;
  readonly isEmpty: boolean;
}

export class AnalyzeTeamUseCase {
  async execute(team: PokemonTeam): Promise<TeamAnalysis> {
    const members = team.getMembers() as readonly TeamMember[];
    if (members.length === 0) {
      const empty = OffensiveAnalyzer.analyze([], new Map());
      return { offensiveCoverage: empty, teamSize: 0, isEmpty: true };
    }
    const moveIds = getMoveIds(members);
    const moveMap = await LocalMoveRepository.getByIds(moveIds);
    const metaMap = new Map<
      string,
      { id: string; type: PokemonType; power: number | null }
    >(
      [...moveMap.entries()].map(([id, dto]) => [
        id.toLowerCase(),
        { id: dto.id, type: dto.type as PokemonType, power: dto.power },
      ]),
    );
    const offensive = OffensiveAnalyzer.analyze(members, metaMap);
    return {
      offensiveCoverage: offensive,
      teamSize: members.length,
      isEmpty: false,
    };
  }
}
