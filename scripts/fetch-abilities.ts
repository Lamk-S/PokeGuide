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

const TOTAL = 367;
const BATCH = 20;

async function fetchAbilities() {
  console.log(`Descargando ${TOTAL} habilidades...`);

  const overridesPath = "data/abilities/overrides.es.json";
  const overrides: Record<string, string> = fs.existsSync(overridesPath)
    ? JSON.parse(fs.readFileSync(overridesPath, "utf-8"))
    : {};

  const listRes = await fetch(`https://pokeapi.co/api/v2/ability?limit=${TOTAL}`);
  const { results } = await listRes.json() as { results: { name: string }[] };

  const dataset = [];
  for (let i = 0; i < results.length; i += BATCH) {
    const batch = results.slice(i, i + BATCH);
    const parsed = await Promise.all(batch.map(async ({ name }) => {
      try {
        const raw = await fetch(`https://pokeapi.co/api/v2/ability/${name}`).then(r => r.json());
        const valid = abilitySchema.parse(raw);

        const nameEs = valid.names.find(n => n.language.name === "es")?.name ?? valid.name;
        const enEffect = valid.effect_entries.find(e => e.language.name === "en")?.short_effect ?? "";

        const esFromApi = valid.effect_entries.find(e => e.language.name === "es")?.short_effect
          || valid.effect_entries.find(e => e.language.name === "es")?.effect
          || valid.flavor_text_entries.find(e => e.language.name === "es")?.flavor_text
          || enEffect;

        return {
          name: valid.name,
          nameEs,
          effect: enEffect,
          effectEs: (overrides[valid.name] ?? esFromApi).replace(/\n|\f/g, " "),
        };
      } catch (e) {
        console.error(`Error ${name}`, e);
        return null;
      }
    }));
    dataset.push(...parsed.filter(Boolean) as any[]);
    console.log(`Batch ${i} -> ${dataset.length}`);
    await new Promise(r => setTimeout(r, 300));
  }

  fs.mkdirSync("data/abilities", { recursive: true });
  fs.writeFileSync("data/abilities/dataset.json", JSON.stringify(dataset, null, 2));
  console.log(`Guardado ${dataset.length} habilidades en data/abilities/dataset.json`);
}

fetchAbilities();