import type { Ability } from "@/domain/abilities/types/ability";
import datasetEs from "../../../../data/abilities/dataset.es.json";

type AbilityWithEs = Ability & {
  nameEs?: string;
  effectEs?: string;
  effect?: string;
};

export class LocalAbilityRepository {
  private readonly abilities: AbilityWithEs[];
  private readonly byName: Map<string, AbilityWithEs>;

  constructor() {
    this.abilities = datasetEs as AbilityWithEs[];
    this.byName = new Map(this.abilities.map((a) => [a.name.toLowerCase(), a]));
  }

  async getAll(): Promise<AbilityWithEs[]> {
    return [...this.abilities];
  }

  async getByName(name: string): Promise<AbilityWithEs | null> {
    return this.byName.get(name.toLowerCase().trim()) ?? null;
  }

  async getByNameEs(nameEs: string): Promise<AbilityWithEs | null> {
    const normalized = nameEs.toLowerCase().trim();
    return (
      this.abilities.find((a) => a.nameEs?.toLowerCase() === normalized) ?? null
    );
  }

  async search(query: string): Promise<AbilityWithEs[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [...this.abilities];
    return this.abilities.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.nameEs?.toLowerCase().includes(q) ||
        a.effectEs?.toLowerCase().includes(q),
    );
  }
}
