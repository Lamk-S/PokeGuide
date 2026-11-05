import { COMPETITIVE_ABILITIES } from "@/domain/abilities/constants/competitiveAbilities";
import rawAbilitiesData from "../../../../data/abilities/dataset.es.json";

type RawAbility = {
  name: string;
  nameEs?: string;
  effect?: string;
  effectEs?: string;
  description?: string;
  descriptionEs?: string;
  id?: string;
};

function parseDataset(data: unknown): RawAbility[] {
  if (Array.isArray(data)) return data as RawAbility[];
  if (data && typeof data === "object" && "abilities" in data) {
    const obj = data as { abilities: unknown };
    if (Array.isArray(obj.abilities)) return obj.abilities as RawAbility[];
  }
  return [];
}

export class LocalAbilityRepository {
  private abilities: RawAbility[] = [];
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    const fromJson = parseDataset(rawAbilitiesData as unknown);
    if (fromJson.length > 0) {
      this.abilities = fromJson;
    } else {
      this.abilities = COMPETITIVE_ABILITIES.map((a) => ({
        name: a.id || a.name,
        nameEs: a.nameEs || a.id,
        descriptionEs: a.descriptionEs || a.description,
        description: a.description,
        id: a.id,
      }));
    }
    this.initialized = true;
  }

  async getAll(): Promise<RawAbility[]> {
    await this.init();
    return this.abilities;
  }

  async getCompetitive(): Promise<RawAbility[]> {
    await this.init();
    if (this.abilities.length > 50) {
      const compSet = new Set(
        COMPETITIVE_ABILITIES.map((a) => a.id.toLowerCase()),
      );
      const filtered = this.abilities.filter((ab) =>
        compSet.has((ab.id || ab.name).toLowerCase()),
      );
      return filtered.length > 0 ? filtered : this.abilities;
    }
    return this.abilities;
  }

  async getByName(name: string): Promise<RawAbility | null> {
    await this.init();
    const norm = name.toLowerCase().replace(/_/g, "-").trim();
    return (
      this.abilities.find(
        (a) =>
          a.name.toLowerCase() === norm ||
          a.nameEs?.toLowerCase() === norm ||
          a.id?.toLowerCase() === norm,
      ) || null
    );
  }

  get abilityList(): RawAbility[] {
    return this.abilities;
  }
}
