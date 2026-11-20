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
  if (!data) return [];
  if (Array.isArray(data)) return data as RawAbility[];
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.abilities)) return obj.abilities as RawAbility[];
    if (Array.isArray(obj.data)) return obj.data as RawAbility[];
    const values = Object.values(obj);
    if (values.length > 0) {
      const isAbilityMap = values.some((v) => {
        if (typeof v !== "object" || v === null) return false;
        const o = v as Record<string, unknown>;
        return (
          "nameEs" in o ||
          "name" in o ||
          "effectEs" in o ||
          "descriptionEs" in o
        );
      });

      if (isAbilityMap) {
        return Object.entries(obj).map(([key, val]) => {
          const o = val as Record<string, unknown>;
          return {
            id: (typeof o.id === "string" ? o.id : key) as string,
            name: (typeof o.name === "string" ? o.name : key) as string,
            nameEs:
              typeof o.nameEs === "string" ? (o.nameEs as string) : undefined,
            description:
              typeof o.description === "string"
                ? (o.description as string)
                : undefined,
            descriptionEs:
              typeof o.descriptionEs === "string"
                ? (o.descriptionEs as string)
                : undefined,
            effect:
              typeof o.effect === "string" ? (o.effect as string) : undefined,
            effectEs:
              typeof o.effectEs === "string"
                ? (o.effectEs as string)
                : undefined,
          } as RawAbility;
        });
      }
    }
  }

  return [];
}

function normalizeAbility(raw: RawAbility): RawAbility {
  return {
    id: String(raw.id ?? raw.name)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-"),
    name: String(raw.name).toLowerCase().trim().replace(/\s+/g, "-"),
    nameEs: raw.nameEs ? String(raw.nameEs).trim() : String(raw.name).trim(),
    description: raw.description ? String(raw.description) : undefined,
    descriptionEs: raw.descriptionEs
      ? String(raw.descriptionEs)
      : raw.effectEs
        ? String(raw.effectEs)
        : undefined,
    effect: raw.effect ? String(raw.effect) : undefined,
    effectEs: raw.effectEs ? String(raw.effectEs) : undefined,
  };
}

export class LocalAbilityRepository {
  private abilities: RawAbility[] = [];
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    const fromJson = parseDataset(rawAbilitiesData as unknown);
    if (fromJson.length > 0) {
      this.abilities = fromJson.map(normalizeAbility);
    } else {
      this.abilities = COMPETITIVE_ABILITIES.map((a) =>
        normalizeAbility({
          name: a.id || a.name,
          nameEs: a.nameEs || a.id,
          descriptionEs: a.descriptionEs || a.description,
          description: a.description,
          id: a.id,
        }),
      );
    }

    const map = new Map<string, RawAbility>();
    for (const ab of this.abilities) {
      const key = (ab.id ?? ab.name).toLowerCase();
      if (!map.has(key)) map.set(key, ab);
    }

    if (map.size < 50) {
      for (const comp of COMPETITIVE_ABILITIES) {
        const key = comp.id.toLowerCase();
        if (!map.has(key)) {
          map.set(
            key,
            normalizeAbility({
              name: comp.id,
              nameEs: comp.nameEs,
              descriptionEs: comp.descriptionEs,
              id: comp.id,
            }),
          );
        }
      }
    }

    this.abilities = Array.from(map.values()).sort((a, b) =>
      (a.nameEs ?? a.name).localeCompare(b.nameEs ?? b.name),
    );
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
