import fs from "fs";
import { moveSchema } from "../src/infrastructure/pokeapi/schemas/move.schema";
import { mapMove } from "../src/infrastructure/pokeapi/mappers/move.mapper";

const TOTAL_MOVES = 937;
const BATCH = 20;

async function fetchMoves() {
  console.log(`Descargando ${TOTAL_MOVES} movimientos...`);
  const listRes = await fetch(`https://pokeapi.co/api/v2/move?limit=${TOTAL_MOVES}`);
  const { results } = await listRes.json() as { results: { name: string }[] };

  const dataset = [];
  for (let i = 0; i < results.length; i += BATCH) {
    const batch = results.slice(i, i + BATCH);
    const parsed = await Promise.all(batch.map(async ({ name }) => {
      try {
        const raw = await fetch(`https://pokeapi.co/api/v2/move/${name}`).then(r => r.json());
        const valid = moveSchema.parse(raw);
        return mapMove(valid);
      } catch (e) {
        console.error(`Error ${name}`, e);
        return null;
      }
    }));
    dataset.push(...parsed.filter(Boolean));
    console.log(`Batch ${i} -> ${dataset.length}`);
    await new Promise(r => setTimeout(r, 300));
  }

  fs.mkdirSync("data/moves", { recursive: true });
  fs.writeFileSync("data/moves/dataset.json", JSON.stringify(dataset, null, 2));
  console.log(`Guardado ${dataset.length} en data/moves/dataset.json`);
}
fetchMoves();