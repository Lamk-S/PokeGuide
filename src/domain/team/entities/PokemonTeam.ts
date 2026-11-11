import type { TeamMember } from "../types/TeamTypes";

export class PokemonTeam {
  public static readonly MAX_MEMBERS = 6 as const;
  private readonly _members: readonly TeamMember[];

  constructor(initialMembers: readonly TeamMember[] = []) {
    if (initialMembers.length > PokemonTeam.MAX_MEMBERS) {
      throw new Error(
        `Un equipo no puede tener más de ${PokemonTeam.MAX_MEMBERS} Pokémon. Recibidos: ${initialMembers.length}`,
      );
    }

    const sanitized = initialMembers.filter(
      (m): m is TeamMember => m !== null && m !== undefined,
    );
    if (sanitized.length !== initialMembers.length) {
      throw new Error("El equipo contiene miembros nulos o indefinidos.");
    }

    for (const member of sanitized) {
      if (!member.id || !member.name) {
        throw new Error("TeamMember inválido: requiere id y name");
      }
      if (!member.types || member.types.length === 0) {
        throw new Error(`TeamMember ${member.id} sin tipos definidos`);
      }
      if (!member.moves) {
        throw new Error(
          `TeamMember ${member.id} debe exponer array de moves (aunque sea vacío)`,
        );
      }
    }

    this._members = Object.freeze([...sanitized]);
    Object.freeze(this);
  }

  get size(): number {
    return this._members.length;
  }

  get members(): readonly TeamMember[] {
    return this._members;
  }

  getMembers(): readonly TeamMember[] {
    return this._members;
  }

  getMemberById(id: string): TeamMember | undefined {
    return this._members.find((m) => m.id === id);
  }

  getAllMoves(): readonly TeamMember["moves"][number][] {
    return this._members.flatMap((m) => [...m.moves]);
  }

  hasType(type: string): boolean {
    return this._members.some((m) =>
      (m.types as readonly string[]).includes(type),
    );
  }

  isEmpty(): boolean {
    return this._members.length === 0;
  }

  isFull(): boolean {
    return this._members.length >= PokemonTeam.MAX_MEMBERS;
  }

  addMember(member: TeamMember): PokemonTeam {
    if (!member) {
      throw new Error("TeamMember no puede ser nulo.");
    }
    if (this.isFull()) {
      throw new Error(`El equipo está lleno (${PokemonTeam.MAX_MEMBERS}/6).`);
    }
    return new PokemonTeam([...this._members, member]);
  }

  removeMember(index: number): PokemonTeam {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= this._members.length
    ) {
      throw new Error(
        `Índice inválido: ${index}. Tamaño actual: ${this._members.length}`,
      );
    }
    const next = this._members.filter((_, i) => i !== index);
    return new PokemonTeam(next);
  }

  replaceMember(index: number, member: TeamMember): PokemonTeam {
    if (!member) {
      throw new Error("TeamMember no puede ser nulo.");
    }
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= this._members.length
    ) {
      throw new Error(`Índice inválido: ${index}.`);
    }
    const next = this._members.map((m, i) => (i === index ? member : m));
    return new PokemonTeam(next);
  }

  clear(): PokemonTeam {
    return new PokemonTeam([]);
  }

  toSnapshot(): { members: readonly TeamMember[]; size: number } {
    return { members: this._members, size: this.size };
  }
}
