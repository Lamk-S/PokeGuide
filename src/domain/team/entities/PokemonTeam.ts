import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";
import type { TeamMember } from "@/domain/team/types/TeamTypes";

export class PokemonTeam {
  private readonly members: readonly TeamMember[];

  constructor(members: readonly TeamMember[]) {
    this.members = Object.freeze([...members]);
    Object.freeze(this);
  }

  getMembers(): readonly TeamMember[] {
    return this.members;
  }

  get size(): number {
    return this.members.length;
  }

  get isEmpty(): boolean {
    return this.members.length === 0;
  }

  get isFull(): boolean {
    return this.members.length >= DEFAULT_BATTLE_RULESET.maxMembers;
  }

  addMember(member: TeamMember): PokemonTeam {
    if (this.isFull) {
      throw new Error("Team is full: maximum 6 members");
    }
    const frozenMember = Object.freeze({
      ...member,
      types: Object.freeze([...member.types]),
      moves: Object.freeze([...member.moves]),
      evs: Object.freeze({ ...member.evs }),
      ivs: Object.freeze({ ...member.ivs }),
      baseStats: Object.freeze({ ...member.baseStats }),
      calculatedStats: Object.freeze({ ...member.calculatedStats }),
      nature: Object.freeze({ ...member.nature }),
    }) as TeamMember;
    return new PokemonTeam([...this.members, frozenMember]);
  }

  removeMember(index: number): PokemonTeam {
    if (index < 0 || index >= this.members.length) {
      throw new Error(`Invalid index ${index}`);
    }
    const next = this.members.filter((_, i) => i !== index);
    return new PokemonTeam(next);
  }

  replaceMember(index: number, member: TeamMember): PokemonTeam {
    if (index < 0 || index >= this.members.length) {
      throw new Error(`Invalid index ${index}`);
    }
    const frozenMember = Object.freeze({
      ...member,
      types: Object.freeze([...member.types]),
      moves: Object.freeze([...member.moves]),
      evs: Object.freeze({ ...member.evs }),
      ivs: Object.freeze({ ...member.ivs }),
      baseStats: Object.freeze({ ...member.baseStats }),
      calculatedStats: Object.freeze({ ...member.calculatedStats }),
      nature: Object.freeze({ ...member.nature }),
    }) as TeamMember;
    const next = [...this.members];
    next[index] = frozenMember;
    return new PokemonTeam(next);
  }

  toggleTera(id: string): PokemonTeam {
    const idx = this.members.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Member ${id} not found`);
    const member = this.members[idx];
    if (!member) throw new Error(`Member ${id} not found`);
    const toggled = Object.freeze({
      ...member,
      isTeraActive: !member.isTeraActive,
    }) as TeamMember;
    const next = [...this.members];
    next[idx] = toggled;
    return new PokemonTeam(next);
  }
}
