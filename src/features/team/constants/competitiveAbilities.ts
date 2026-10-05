export interface CompetitiveAbility {
  readonly id: string;
  readonly nameEs: string;
  readonly immunityType?: string;
  readonly descriptionEs: string;
}

export const COMPETITIVE_ABILITIES: readonly CompetitiveAbility[] = [
  {
    id: "levitate",
    nameEs: "Levitación",
    immunityType: "ground",
    descriptionEs: "Inmunidad a Tierra",
  },
  {
    id: "water-absorb",
    nameEs: "Absorbe Agua",
    immunityType: "water",
    descriptionEs: "Cura con Agua, inmune",
  },
  {
    id: "storm-drain",
    nameEs: "Colector",
    immunityType: "water",
    descriptionEs: "Sube At Esp con Agua, inmune",
  },
  {
    id: "dry-skin",
    nameEs: "Piel Seca",
    immunityType: "water",
    descriptionEs: "Cura con Agua, inmune, débil a Fuego",
  },
  {
    id: "sap-sipper",
    nameEs: "Herbívoro",
    immunityType: "grass",
    descriptionEs: "Sube Atq con Planta, inmune",
  },
  {
    id: "volt-absorb",
    nameEs: "Absorbe Elec",
    immunityType: "electric",
    descriptionEs: "Cura con Eléctrico, inmune",
  },
  {
    id: "motor-drive",
    nameEs: "Electromotor",
    immunityType: "electric",
    descriptionEs: "Sube Vel con Eléctrico, inmune",
  },
  {
    id: "lightning-rod",
    nameEs: "Pararrayos",
    immunityType: "electric",
    descriptionEs: "Sube At Esp con Eléctrico, inmune",
  },
  {
    id: "flash-fire",
    nameEs: "Absorbe Fuego",
    immunityType: "fire",
    descriptionEs: "Potencia Fuego tras recibirlo, inmune",
  },
  {
    id: "well-baked-body",
    nameEs: "Cuerpo Horneado",
    immunityType: "fire",
    descriptionEs: "+2 Def tras Fuego, inmune",
  },
  {
    id: "earth-eater",
    nameEs: "Come Tierra",
    immunityType: "ground",
    descriptionEs: "Cura con Tierra, inmune",
  },
  {
    id: "intimidate",
    nameEs: "Intimidación",
    descriptionEs: "-1 Atq rival al entrar",
  },
  { id: "speed-boost", nameEs: "Impulso", descriptionEs: "+1 Vel cada turno" },
  {
    id: "prankster",
    nameEs: "Bromista",
    descriptionEs: "Prioridad a movimientos estado",
  },
  { id: "guts", nameEs: "Agallas", descriptionEs: "+50% Atq con estado" },
  { id: "huge-power", nameEs: "Potencia", descriptionEs: "x2 Atq" },
  {
    id: "multiscale",
    nameEs: "Compensación",
    descriptionEs: "Mitad daño con PS completos",
  },
  {
    id: "regenerator",
    nameEs: "Regeneración",
    descriptionEs: "Cura 33% al cambiar",
  },
  { id: "", nameEs: "Sin habilidad", descriptionEs: "Sin habilidad asignada" },
] as const;

export function translateAbilityToSpanish(id: string): string {
  const found = COMPETITIVE_ABILITIES.find((a) => a.id === id);
  return (
    found?.nameEs ??
    (id
      ? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Sin habilidad")
  );
}
