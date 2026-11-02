import { normalizeId } from "@/domain/shared/utils/normalizeId";

export interface CompetitiveAbility {
  id: string;
  name: string;
  nameEs: string;
  description?: string;
  descriptionEs?: string;
}

export const COMPETITIVE_ABILITIES: CompetitiveAbility[] = [
  {
    id: "intimidate",
    name: "intimidate",
    nameEs: "Intimidación",
    description: "Lowers foe Attack on entry",
    descriptionEs: "Baja Ataque rival al entrar",
  },
  {
    id: "levitate",
    name: "levitate",
    nameEs: "Levitación",
    description: "Immune to Ground",
    descriptionEs: "Inmune a Tierra",
  },
  {
    id: "blaze",
    name: "blaze",
    nameEs: "Mar Llamas",
    description: "Powers up Fire when low HP",
    descriptionEs: "Potencia Fuego con poca vida",
  },
  {
    id: "torrent",
    name: "torrent",
    nameEs: "Torrente",
    description: "Powers up Water when low HP",
    descriptionEs: "Potencia Agua con poca vida",
  },
  {
    id: "overgrow",
    name: "overgrow",
    nameEs: "Espesura",
    description: "Powers up Grass when low HP",
    descriptionEs: "Potencia Planta con poca vida",
  },
  {
    id: "swarm",
    name: "swarm",
    nameEs: "Enjambre",
    description: "Powers up Bug when low HP",
    descriptionEs: "Potencia Bicho con poca vida",
  },
  {
    id: "solar-power",
    name: "solar-power",
    nameEs: "Poder Solar",
    description: "Boosts SpA in sun",
    descriptionEs: "Sube At.Esp con sol",
  },
  {
    id: "flash-fire",
    name: "flash-fire",
    nameEs: "Absorbe Fuego",
    description: "Immune Fire, boosts Fire",
    descriptionEs: "Inmune a Fuego, sube Fuego",
  },
  {
    id: "water-absorb",
    name: "water-absorb",
    nameEs: "Absorbe Agua",
    description: "Heals with Water",
    descriptionEs: "Cura con Agua",
  },
  {
    id: "volt-absorb",
    name: "volt-absorb",
    nameEs: "Absorbe Electricidad",
    description: "Heals with Electric",
    descriptionEs: "Cura con Eléctrico",
  },
  {
    id: "guts",
    name: "guts",
    nameEs: "Agallas",
    description: "Boosts Attack with status",
    descriptionEs: "Sube Ataque con estado",
  },
  {
    id: "huge-power",
    name: "huge-power",
    nameEs: "Potencia",
    description: "Doubles Attack",
    descriptionEs: "Duplica Ataque",
  },
  {
    id: "speed-boost",
    name: "speed-boost",
    nameEs: "Impulso",
    description: "Raises Speed each turn",
    descriptionEs: "Sube Velocidad cada turno",
  },
  {
    id: "protean",
    name: "protean",
    nameEs: "Mutatipo",
    description: "Changes type on attack",
    descriptionEs: "Cambia tipo al atacar",
  },
  {
    id: "libero",
    name: "libero",
    nameEs: "Líbero",
    description: "Changes type on attack",
    descriptionEs: "Cambia tipo al atacar",
  },
  {
    id: "multiscale",
    name: "multiscale",
    nameEs: "Compensación",
    description: "Reduces dmg at full HP",
    descriptionEs: "Reduce daño con PS llenos",
  },
  {
    id: "regenerator",
    name: "regenerator",
    nameEs: "Regeneración",
    description: "Heals on switch out",
    descriptionEs: "Cura al salir",
  },
  {
    id: "intrepid-sword",
    name: "intrepid-sword",
    nameEs: "Espada Indómita",
    description: "Boosts Attack on entry",
    descriptionEs: "Sube Ataque al entrar",
  },
  {
    id: "dauntless-shield",
    name: "dauntless-shield",
    nameEs: "Escudo Recio",
    description: "Boosts Defense on entry",
    descriptionEs: "Sube Defensa al entrar",
  },
  {
    id: "adaptability",
    name: "adaptability",
    nameEs: "Adaptable",
    description: "STAB 2x",
    descriptionEs: "STAB 2x en vez de 1.5x",
  },
  {
    id: "mold-breaker",
    name: "mold-breaker",
    nameEs: "Rompemoldes",
    description: "Ignores abilities",
    descriptionEs: "Ignora habilidades",
  },
  {
    id: "magic-guard",
    name: "magic-guard",
    nameEs: "Muro Mágico",
    description: "Only direct damage",
    descriptionEs: "Solo daño directo",
  },
];

const MAP_ES = new Map<string, string>(
  COMPETITIVE_ABILITIES.map((a) => [normalizeId(a.id), a.nameEs]),
);
const COMPETITIVE_SET = new Set(
  COMPETITIVE_ABILITIES.map((a) => normalizeId(a.id)),
);

export function translateAbilityToSpanish(id: string): string | undefined {
  return MAP_ES.get(normalizeId(id));
}

export function isCompetitiveAbility(id: string): boolean {
  return COMPETITIVE_SET.has(normalizeId(id));
}

export function filterCompetitiveAbilities<
  T extends { name: string; nameEs?: string; id?: string },
>(items: T[]): T[] {
  if (!items || items.length === 0) return items;
  const filtered = items.filter((i) => {
    const candidate = (i as { id?: string }).id || i.name || i.nameEs || "";
    return isCompetitiveAbility(candidate);
  });
  return filtered.length >= 5 ? filtered : items;
}

export const VALID_ABILITY_IDS = COMPETITIVE_SET;
