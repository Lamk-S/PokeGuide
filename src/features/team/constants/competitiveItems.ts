export interface CompetitiveItem {
  readonly id: string;
  readonly nameEs: string;
  readonly descriptionEs: string;
  readonly category:
    | "choice"
    | "recovery"
    | "offensive"
    | "defensive"
    | "utility";
}

export const COMPETITIVE_ITEMS: readonly CompetitiveItem[] = [
  {
    id: "choice-scarf",
    nameEs: "Pañuelo Elegido",
    descriptionEs: "+50% Vel, solo 1 mov",
    category: "choice",
  },
  {
    id: "choice-band",
    nameEs: "Cinta Elegida",
    descriptionEs: "+50% Atq, solo 1 mov",
    category: "choice",
  },
  {
    id: "choice-specs",
    nameEs: "Gafas Elegidas",
    descriptionEs: "+50% At Esp, solo 1 mov",
    category: "choice",
  },
  {
    id: "leftovers",
    nameEs: "Restos",
    descriptionEs: "Recupera 1/16 PS por turno",
    category: "recovery",
  },
  {
    id: "life-orb",
    nameEs: "Vidasfera",
    descriptionEs: "+30% daño, -10% PS",
    category: "offensive",
  },
  {
    id: "focus-sash",
    nameEs: "Banda Focus",
    descriptionEs: "Sobrevive con 1 PS",
    category: "defensive",
  },
  {
    id: "heavy-duty-boots",
    nameEs: "Botas Gruesas",
    descriptionEs: "Inmune a hazards",
    category: "utility",
  },
  {
    id: "assault-vest",
    nameEs: "Chaleco Asalto",
    descriptionEs: "+50% Def Esp, solo ataques",
    category: "defensive",
  },
  {
    id: "rocky-helmet",
    nameEs: "Casco Dentado",
    descriptionEs: "Daño al contacto",
    category: "defensive",
  },
  {
    id: "air-balloon",
    nameEs: "Globo",
    descriptionEs: "Inmunidad Tierra hasta golpe",
    category: "utility",
  },
  {
    id: "black-sludge",
    nameEs: "Lodo Negro",
    descriptionEs: "Veneno cura, resto daña",
    category: "recovery",
  },
  {
    id: "eviolite",
    nameEs: "Mineral Evol",
    descriptionEs: "+50% Def/DefEsp si no evolucionado",
    category: "defensive",
  },
  {
    id: "light-clay",
    nameEs: "Roca Suave",
    descriptionEs: "Pantallas duran 8 turnos",
    category: "utility",
  },
  {
    id: "sitrus-berry",
    nameEs: "Baya Ziuela",
    descriptionEs: "Cura 25% PS al 50%",
    category: "recovery",
  },
  {
    id: "",
    nameEs: "Sin objeto",
    descriptionEs: "Sin objeto equipado",
    category: "utility",
  },
] as const;

export function translateItemToSpanish(id: string): string {
  const found = COMPETITIVE_ITEMS.find((i) => i.id === id);
  return (
    found?.nameEs ??
    (id
      ? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Sin objeto")
  );
}
