import fs from "fs";
import path from "path";
import { pokeApiPokemonSchema } from "../src/infrastructure/pokeapi/schemas/pokemon.schema";
import { mapPokeApiToPokemon } from "../src/infrastructure/pokeapi/mappers/pokemon.mapper";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const BATCH_SIZE = 20; // peticiones en paralelo, PokeAPI se queja si le pegas con 1000 a la vez
const DELAY_BETWEEN_BATCHES = 500; // ms

// Si solo quieres los 1025 canonicos, cambia a 1025
// Si quieres TODO con formas, usa 2000
const TOTAL_POKEMON = 2000; 

async function getAllPokemonNames(): Promise<string[]> {
  console.log(`Pidiendo lista de ${TOTAL_POKEMON} pokemons...`);
  const res = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=${TOTAL_POKEMON}&offset=0`);
  if (!res.ok) throw new Error(`No se pudo obtener la lista: ${res.status}`);
  const data = await res.json();
  return data.results.map((p: { name: string }) => p.name);
}

async function fetchAndNormalizePokemon() {
  console.log("Iniciando pipeline (Ingestion -> Validation -> Normalization)...");
  
  const allNames = await getAllPokemonNames();
  console.log(`Encontrados ${allNames.length} pokemons. Iniciando descarga...`);

  const dataset = [];
  let processed = 0;

  // Procesamos en lotes para no banearse
  for (let i = 0; i < allNames.length; i += BATCH_SIZE) {
    const batch = allNames.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (name) => {
      try {
        // 1. Ingestion
        const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${name}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rawData = await response.json();

        // 2. Validation
        const validDto = pokeApiPokemonSchema.parse(rawData);

        // 3. Normalization
        return mapPokeApiToPokemon(validDto);
      } catch (error) {
        console.error(`❌ Error procesando ${name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    
    for (const poke of results) {
      if (poke) {
        dataset.push(poke);
        processed++;
        console.log(`✅ [${processed}/${allNames.length}] ${poke.name} normalizado`);
      }
    }

    // Pausa entre lotes
    await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
  }

  // 4. Escribir JSON local versionado
  const outPath = path.resolve(__dirname, "../data/pokemon/dataset.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2));

  console.log(`\nDataset completo guardado: ${dataset.length} pokemons en ${outPath}`);
}

fetchAndNormalizePokemon();