import fs from "fs";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string(),
  names: z.array(z.object({ name: z.string(), language: z.object({ name: z.string() }) })),
  effect_entries: z.array(z.object({ 
    effect: z.string(), 
    short_effect: z.string(), 
    language: z.object({ name: z.string() }) 
  })),
  flavor_text_entries: z.array(z.object({ 
    text: z.string(), 
    language: z.object({ name: z.string() }) 
  })),
});

const TOTAL = 1000;
const BATCH = 20;

async function fetchItems() {
  console.log(`Descargando ${TOTAL} items...`);

  const overridesPath = "data/items/overrides.es.json";
  const overrides: Record<string, string> = fs.existsSync(overridesPath)
    ? JSON.parse(fs.readFileSync(overridesPath, "utf-8"))
    : {};

  const listRes = await fetch(`https://pokeapi.co/api/v2/item?limit=${TOTAL}`);
  const { results } = await listRes.json() as { results: { name: string }[] };

  const dataset = [];
  for (let i = 0; i < results.length; i += BATCH) {
    const batch = results.slice(i, i + BATCH);
    const parsed = await Promise.all(batch.map(async ({ name }) => {
      try {
        const raw = await fetch(`https://pokeapi.co/api/v2/item/${name}`).then(r => r.json());
        const valid = itemSchema.parse(raw);

        const enEntry = valid.effect_entries.find(e => e.language.name === "en");
        if (!enEntry) return null;

        const nameEs = valid.names.find(n => n.language.name === "es")?.name ?? valid.name;

        const esFromApi = valid.effect_entries.find(e => e.language.name === "es")?.short_effect
          || valid.effect_entries.find(e => e.language.name === "es")?.effect
          || valid.flavor_text_entries.find(e => e.language.name === "es")?.text
          || enEntry.short_effect;

        return {
          name: valid.name,
          nameEs,
          effect: enEntry.short_effect,
          effectEs: (overrides[valid.name] ?? esFromApi).replace(/\n|\f/g, " "),
        };
      } catch {
        return null;
      }
    }));
    dataset.push(...parsed.filter(Boolean) as any[]);
    console.log(`Batch ${i} -> ${dataset.length} items válidos`);
    await new Promise(r => setTimeout(r, 300));
  }

  fs.mkdirSync("data/items", { recursive: true });
  fs.writeFileSync("data/items/dataset.json", JSON.stringify(dataset, null, 2));
  console.log(`Guardado ${dataset.length} items en data/items/dataset.json`);
}

fetchItems();