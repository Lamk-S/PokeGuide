import fs from "fs";
import path from "path";
import { pokeApiPokemonSchema } from "../src/infrastructure/pokeapi/schemas/pokemon.schema";
import { mapPokeApiToPokemon } from "../src/infrastructure/pokeapi/mappers/pokemon.mapper";

const TARGET_POKEMON = ["pikachu", "charizard", "garchomp", "dragonite", "ditto"];
const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

async function fetchAndNormalizePokemon() {
  console.log("Iniciando pipeline de datos (Ingestion -> Validation -> Normalization)...");
  const dataset = [];

  for (const name of TARGET_POKEMON) {
    try {
      // 1. Ingestion
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${name}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rawData = await response.json();

      // 2. Validation (Frontera externa)
      const validDto = pokeApiPokemonSchema.parse(rawData);

      // 3. Normalization (Mapeo a Dominio)
      const domainPokemon = mapPokeApiToPokemon(validDto);
      dataset.push(domainPokemon);
      console.log(`✅ ${name} normalizado exitosamente.`);
    } catch (error) {
      console.error(`❌ Error procesando ${name}:`, error);
    }
  }

  // 4. Escribir JSON local versionado
  const outPath = path.resolve(__dirname, "../data/pokemon/dataset.json");
  fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2));
  console.log(`\nDataset guardado en ${outPath}`);
}

fetchAndNormalizePokemon();