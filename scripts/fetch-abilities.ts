import fs from "fs";
import { z } from "zod";

const abilitySchema = z.object({
  name: z.string(),
  names: z.array(z.object({ name: z.string(), language: z.object({ name: z.string() }) })),
  effect_entries: z.array(z.object({ 
    effect: z.string(), 
    short_effect: z.string(), 
    language: z.object({ name: z.string() }) 
  })),
  flavor_text_entries: z.array(z.object({ 
    flavor_text: z.string(), 
    language: z.object({ name: z.string() }) 
  })),
});

async function fetchAbilities() {
  const overridesPath = "data/abilities/overrides.es.json";
  const overrides: Record<string, string> = fs.existsSync(overridesPath)
    ? JSON.parse(fs.readFileSync(overridesPath, "utf-8"))
    : {};

  const initRes = await fetch(`https://pokeapi.co/api/v2/ability?limit=1`);
  if (!initRes.ok) throw new Error("Fallo al contactar PokeAPI");
  const { count } = await initRes.json() as { count: number };

  console.log(`Descargando ${count} habilidades usando paginación dinámica...`);
  
  const listRes = await fetch(`https://pokeapi.co/api/v2/ability?limit=${count}`);
  const { results } = await listRes.json() as { results: { name: string, url: string }[] };

  const dataset: unknown[] = [];
  const BATCH_SIZE = 30;

  for (let i = 0; i < results.length; i += BATCH_SIZE) {
    const batch = results.slice(i, i + BATCH_SIZE);
    
    const parsed = await Promise.all(batch.map(async ({ name, url }) => {
      try {
        const rawRes = await fetch(url);
        if (!rawRes.ok) return null;
        
        const raw = await rawRes.json();
        const valid = abilitySchema.parse(raw);

        const nameEs = valid.names.find(n => n.language.name === "es")?.name ?? valid.name;
        const enEffect = valid.effect_entries.find(e => e.language.name === "en")?.short_effect ?? "";
        const esFromApi = valid.effect_entries.find(e => e.language.name === "es")?.short_effect
          || valid.flavor_text_entries.find(e => e.language.name === "es")?.flavor_text
          || enEffect;

        return {
          name: valid.name,
          nameEs,
          effect: enEffect,
          effectEs: (overrides[valid.name] ?? esFromApi).replace(/\n|\f/g, " "),
        };
      } catch (error) {
        console.warn(`[WARN] Fallo al parsear habilidad: ${name}`);
        return null;
      }
    }));
    
    dataset.push(...parsed.filter((item): item is NonNullable<typeof item> => item !== null));
  }

  fs.mkdirSync("data/abilities", { recursive: true });
  fs.writeFileSync("data/abilities/dataset.json", JSON.stringify(dataset, null, 2));
  console.log(`Dataset generado con éxito. Generadas ${dataset.length} entradas.`);
}

fetchAbilities().catch(console.error);