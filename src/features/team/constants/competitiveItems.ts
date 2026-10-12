import { normalizeId } from "@/domain/shared/utils/normalizeId";

export interface CompetitiveItem {
  id: string;
  name: string;
  nameEs: string;
  description?: string;
  descriptionEs?: string;
}

export const COMPETITIVE_ITEMS: CompetitiveItem[] = [
  {
    id: "life-orb",
    name: "life-orb",
    nameEs: "Vidasfera",
    description: "Boosts power 30% at cost of HP",
    descriptionEs: "Potencia 30% a cambio de PS",
  },
  {
    id: "choice-band",
    name: "choice-band",
    nameEs: "Cinta Elegida",
    description: "Boosts Attack 50%, locks move",
    descriptionEs: "Sube Ataque 50%, bloquea movimiento",
  },
  {
    id: "choice-specs",
    name: "choice-specs",
    nameEs: "Gafas Elegidas",
    description: "Boosts SpA 50%, locks move",
    descriptionEs: "Sube At.Esp 50%, bloquea movimiento",
  },
  {
    id: "choice-scarf",
    name: "choice-scarf",
    nameEs: "Pañuelo Elegido",
    description: "Boosts Speed 50%, locks move",
    descriptionEs: "Sube Velocidad 50%, bloquea movimiento",
  },
  {
    id: "leftovers",
    name: "leftovers",
    nameEs: "Restos",
    description: "Restores HP each turn",
    descriptionEs: "Restaura PS cada turno",
  },
  {
    id: "black-sludge",
    name: "black-sludge",
    nameEs: "Lodo Negro",
    description: "Poison heal, others hurt",
    descriptionEs: "Cura a Veneno, daña a otros",
  },
  {
    id: "heavy-duty-boots",
    name: "heavy-duty-boots",
    nameEs: "Botas Gruesas",
    description: "Immune to hazards",
    descriptionEs: "Inmune a púas",
  },
  {
    id: "assault-vest",
    name: "assault-vest",
    nameEs: "Chaleco Asalto",
    description: "Boosts SpD 50%, no status moves",
    descriptionEs: "Sube Def.Esp 50%, sin estados",
  },
  {
    id: "focus-sash",
    name: "focus-sash",
    nameEs: "Banda Focus",
    description: "Survives one hit at full HP",
    descriptionEs: "Sobrevive 1 golpe a PS llenos",
  },
  {
    id: "rocky-helmet",
    name: "rocky-helmet",
    nameEs: "Casco Dentado",
    description: "Damages attacker on contact",
    descriptionEs: "Daña al atacante por contacto",
  },
  {
    id: "eviolite",
    name: "eviolite",
    nameEs: "Mineral Evolutivo",
    description: "Boosts Def/SpD if not fully evolved",
    descriptionEs: "Sube Def/Def.Esp si no está evolucionado",
  },
  {
    id: "light-clay",
    name: "light-clay",
    nameEs: "Refleluz",
    description: "Extends screens duration",
    descriptionEs: "Extiende pantallas",
  },
  {
    id: "loaded-dice",
    name: "loaded-dice",
    nameEs: "Dado Trucado",
    description: "Multi-hit always hits high",
    descriptionEs: "Golpes múltiples pegan más veces",
  },
  {
    id: "booster-energy",
    name: "booster-energy",
    nameEs: "Energía Potenciadora",
    description: "Activates Paradox ability",
    descriptionEs: "Activa habilidad Paradoja",
  },
];

export function translateItemToSpanish(id: string): string | undefined {
  return COMPETITIVE_ITEMS.find((i) => normalizeId(i.id) === normalizeId(id))
    ?.nameEs;
}
export function isCompetitiveItem(id: string): boolean {
  return COMPETITIVE_ITEMS.some((i) => normalizeId(i.id) === normalizeId(id));
}
