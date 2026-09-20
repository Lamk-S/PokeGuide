const FULL_OVERRIDES: Record<string, string> = {
  "mr-mime": "Mr. Mime",
  "mr-rime": "Mr. Rime",
  "mime-jr": "Mime Jr.",
  "type-null": "Tipo: Null",
  "nidoran-f": "Nidoran ♀",
  "nidoran-m": "Nidoran ♂",
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  flabebe: "Flabébé",
  "ho-oh": "Ho-Oh",
  "porygon-z": "Porygon-Z",
  "zygarde-50": "Zygarde 50%",
  "zygarde-10": "Zygarde 10%",
  "zygarde-complete": "Zygarde Completo",
  "zygarde-10-power-construct": "Zygarde 10%",
  "zygarde-50-power-construct": "Zygarde 50%",
  "zygarde-50-power-construct-complete": "Zygarde Completo",
  "eternatus-eternamax": "Eternatus Eternamax",
};

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatBaseName(slug: string): string {
  if (FULL_OVERRIDES[slug]) return FULL_OVERRIDES[slug];
  // casos base especiales
  const special: Record<string, string> = {
    "mr-mime": "Mr. Mime",
    "mr-rime": "Mr. Rime",
    "mime-jr": "Mime Jr.",
    "type-null": "Tipo: Null",
    "nidoran-f": "Nidoran ♀",
    "nidoran-m": "Nidoran ♂",
  };
  if (special[slug]) return special[slug];
  return slug
    .split("-")
    .map((w) => capitalize(w))
    .join(" ");
}

function formatRegion(r: string): string {
  const map: Record<string, string> = {
    alola: "Alola",
    galar: "Galar",
    hisui: "Hisui",
    paldea: "Paldea",
  };
  return map[r] ?? capitalize(r);
}

function formatCapRegion(r: string): string {
  const map: Record<string, string> = {
    original: "Original",
    hoenn: "Hoenn",
    sinnoh: "Sinnoh",
    unova: "Unova",
    kalos: "Kalos",
    alola: "Alola",
    partner: "Compañero",
    world: "Mundial",
  };
  return map[r] ?? capitalize(r);
}

function genericFormat(slug: string): string {
  const parts = slug.split("-");
  const base = parts[0];
  const rest = parts.slice(1);
  const baseFormatted = formatBaseName(base);
  if (rest.length === 0) return baseFormatted;

  const suffixMap: Record<string, string> = {
    altered: "Alterada",
    origin: "Origen",
    attack: "Ataque",
    defense: "Defensa",
    speed: "Velocidad",
    plant: "Planta",
    sandy: "Arenosa",
    trash: "Basura",
    heat: "Calor",
    wash: "Lavado",
    frost: "Helada",
    fan: "Ventilador",
    mow: "Corte",
    sky: "Cielo",
    zen: "Zen",
    standard: "Estándar",
    incarnate: "Avatar",
    therian: "Tótem",
    resolute: "Resuelta",
    aria: "Aria",
    pirouette: "Pirueta",
    shield: "Escudo",
    blade: "Filo",
    average: "Promedio",
    small: "Pequeña",
    large: "Grande",
    super: "Súper",
    gmax: "Gigamax",
    gigantamax: "Gigamax",
    rock: "Roca",
    belle: "Bella",
    pop: "Pop",
    phd: "PhD",
    libre: "Libre",
    star: "Estrella",
  };

  const formattedRest = rest
    .map((p) => {
      if (suffixMap[p]) return suffixMap[p];
      if (/^\d+$/.test(p)) return p;
      return capitalize(p);
    })
    .join(" ");

  return `${baseFormatted} ${formattedRest}`.trim();
}

export function formatPokemonDisplayName(slug: string): string {
  if (!slug) return "";
  const lower = slug.toLowerCase().trim();

  if (FULL_OVERRIDES[lower]) return FULL_OVERRIDES[lower];

  const megaRegex1 = /^(.+)-mega-([xyz])$/;
  const megaRegex2 = /^(.+)-mega$/;
  const megaRegex3 = /^(.+)-meg([xy])$/;

  let m = lower.match(megaRegex1);
  if (m) {
    const base = m[1];
    const suffix = m[2].toUpperCase();
    return `Mega ${formatBaseName(base)} ${suffix}`.trim();
  }
  m = lower.match(megaRegex2);
  if (m) {
    const base = m[1];
    return `Mega ${formatBaseName(base)}`;
  }
  m = lower.match(megaRegex3);
  if (m) {
    const base = m[1];
    const suffix = m[2].toUpperCase();
    return `Mega ${formatBaseName(base)} ${suffix}`.trim();
  }

  if (lower.endsWith("-cap")) {
    const withoutCap = lower.slice(0, -4);
    const parts = withoutCap.split("-");
    const capRegion = parts[parts.length - 1];
    const baseParts = parts.slice(0, -1);
    const base = baseParts.join("-") || "pikachu";
    return `${formatBaseName(base)} con Gorra de ${formatCapRegion(capRegion)}`;
  }

  if (lower.endsWith("-eternamax")) {
    const base = lower.replace("-eternamax", "");
    return `${formatBaseName(base)} Eternamax`;
  }

  const regionalMatch = lower.match(/-(alola|galar|hisui|paldea)$/);
  if (regionalMatch) {
    const region = regionalMatch[1];
    const base = lower.replace(`-${region}`, "");
    return `${formatBaseName(base)} de ${formatRegion(region)}`;
  }

  return genericFormat(lower);
}
