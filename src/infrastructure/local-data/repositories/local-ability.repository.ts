import type { Ability } from "@/domain/abilities/types/ability";
import dataset from "../../../../data/abilities/dataset.json";

export class LocalAbilityRepository {
  private abilities: Ability[] = dataset as Ability[];
  private lookupMap: Map<string, Ability>;

  constructor() {
    this.lookupMap = new Map();
    for (const ability of this.abilities) {
      this.lookupMap.set(ability.name, ability);
    }
  }

  async getAll(): Promise<Ability[]> {
    return this.abilities;
  }

  async getByName(name: string): Promise<Ability | undefined> {
    return this.lookupMap.get(name);
  }
}
