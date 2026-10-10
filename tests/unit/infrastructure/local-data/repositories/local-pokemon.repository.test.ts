import { describe, it, expect } from "vitest";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";

describe("LocalPokemonRepository", () => {
  const repo = new LocalPokemonRepository();

  it("getAllOptimized y getAll devuelven la lista completa", async () => {
    const opt = await repo.getAllOptimized();
    const full = await repo.getAll();
    expect(opt.length).toBeGreaterThan(0);
    expect(full.length).toBeGreaterThan(0);
  });

  it("getById y getByName obtienen el pokemon correcto o null si no existe", async () => {
    const p1 = await repo.getById(25);
    expect(p1?.name).toBe("pikachu");

    const p2 = await repo.getByName("charizard");
    expect(p2?.id).toBe(6);

    const notFound = await repo.getById(999999);
    expect(notFound).toBeNull();
  });

  it("getByNameEs busca correctamente por el nombre en español", async () => {
    const p = await repo.getByNameEs("pikachu");
    expect(p).toBeDefined();
    expect(p?.id).toBe(25);
    
    const notFound = await repo.getByNameEs("no-existe");
    expect(notFound).toBeNull();
  });

  it("search y searchOptimized filtran por nombre o tipo, o devuelven todo si la query está vacía", async () => {
    const searchName = await repo.search("pikachu");
    expect(searchName.length).toBeGreaterThan(0);
    expect(searchName[0].name).toBe("pikachu");

    const searchType = await repo.searchOptimized("electric");
    expect(searchType.some(p => p.types.includes("electric"))).toBe(true);

    const emptySearch = await repo.search("");
    expect(emptySearch.length).toBeGreaterThan(100);
    
    const emptySearchOpt = await repo.searchOptimized("   ");
    expect(emptySearchOpt.length).toBeGreaterThan(100);
  });

  it("getByType devuelve solo los pokemon del tipo especificado", async () => {
    const fireTypes = await repo.getByType("fire");
    expect(fireTypes.length).toBeGreaterThan(0);
    expect(fireTypes.every(p => p.types.includes("fire"))).toBe(true);
  });

  it("getCustomForms devuelve el array de formas personalizadas", async () => {
    const customs = await repo.getCustomForms();
    expect(Array.isArray(customs)).toBe(true);
  });

  it("getByBstRange filtra correctamente por rango de BST", async () => {
    const range = await repo.getByBstRange(600, 600);
    expect(range.length).toBeGreaterThan(0);
    expect(range.every(p => p.bst === 600)).toBe(true);
  });
});