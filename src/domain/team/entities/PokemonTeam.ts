import type { TeamMember } from "../types/TeamTypes";

export class PokemonTeam {
  private readonly MAX_MEMBERS = 6;
  private members: TeamMember[] = [];

  constructor(initialMembers: TeamMember[] = []) {
    if (initialMembers.length > this.MAX_MEMBERS) {
      throw new Error(
        `Un equipo no puede tener más de ${this.MAX_MEMBERS} Pokémon.`,
      );
    }
    this.members = [...initialMembers];
  }

  addMember(member: TeamMember): void {
    if (this.members.length >= this.MAX_MEMBERS) {
      throw new Error("El equipo está lleno.");
    }
    this.members.push(member);
  }

  removeMember(index: number): void {
    if (index < 0 || index >= this.members.length)
      throw new Error("Índice inválido.");
    this.members.splice(index, 1);
  }

  getMembers(): TeamMember[] {
    return [...this.members];
  }
}
