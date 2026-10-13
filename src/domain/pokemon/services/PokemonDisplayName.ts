function formatBaseName(base: string | undefined): string {
  if (!base) return "";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function formatCapRegion(region: string | undefined): string {
  if (!region) return "";
  return formatBaseName(region);
}

function formatRegion(region: string | undefined): string {
  if (!region) return "";
  return formatBaseName(region);
}

export function getPokemonDisplayName(rawName: string): string {
  if (!rawName) return "";
  const parts = rawName.split("-");
  const base = parts[0];
  const baseFormatted = formatBaseName(base);

  if (rawName.includes("-mega")) {
    const megaMatch = rawName.match(/^(.*)-mega-?(.*)?$/);
    if (megaMatch) {
      const b = megaMatch[1];
      const suffixRaw = megaMatch[2];
      if (suffixRaw) {
        const suffix = suffixRaw.toUpperCase();
        return `Mega ${formatBaseName(b)} ${suffix}`.trim();
      }
      return `Mega ${formatBaseName(b)}`.trim();
    }
  }

  if (rawName.includes("-gmax")) {
    const b = rawName.split("-gmax")[0];
    return `${formatBaseName(b)} Gigamax`;
  }

  if (rawName.includes("-cap")) {
    const capMatch = rawName.match(/^(.*)-cap-(.*)$/);
    if (capMatch) {
      const b = capMatch[1];
      const capRegion = capMatch[2];
      if (!b || !capRegion) return baseFormatted;
      return `${formatBaseName(b)} con Gorra de ${formatCapRegion(capRegion)}`;
    }
  }

  if (
    rawName.endsWith("-alola") ||
    rawName.endsWith("-galar") ||
    rawName.endsWith("-hisui") ||
    rawName.endsWith("-paldea")
  ) {
    const regionMatch = rawName.match(/^(.*)-(alola|galar|hisui|paldea)$/);
    if (regionMatch) {
      const b = regionMatch[1];
      const region = regionMatch[2];
      if (!b || !region) return baseFormatted;
      return `${formatBaseName(b)} de ${formatRegion(region)}`;
    }
  }

  return (
    baseFormatted ||
    rawName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export const formatPokemonDisplayName = getPokemonDisplayName;
