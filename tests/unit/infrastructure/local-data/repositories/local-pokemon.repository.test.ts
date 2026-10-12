import { describe, it, expect, beforeAll } from "vitest";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";

describe("LocalPokemonRepository", () => {
  const repo = new LocalPokemonRepository();

  beforeAll(async () => {
    await repo.init();
  }, 15000);

  it("getAllOptimized y getAll devuelven la lista completa", async () => {
    const opt = await repo.getAllOptimized();
    const full = await repo.getAll();
    expect(opt.length).toBeGreaterThan(0);
    expect(full.length).toBeGreaterThan(0);
    expect(full.length).toBeGreaterThanOrEqual(opt.length);
  }, 15000);

  it("getById y getByName obtienen el pokemon correcto o null si no existe", async () => {
    const byId = await repo.getById(25);
    expect(byId?.name.toLowerCase()).toBe("pikachu");
    const byName = await repo.getByName("Pikachu");
    expect(byName?.id).toBe(25);
    const missing = await repo.getById(999999);
    expect(missing).toBeNull();
  });

  it("getByNameEs busca correctamente por el nombre en español", async () => {
    const p = await repo.getByNameEs("Pikachu");
    expect(p).not.toBeNull();
  });

  it("search y searchOptimized filtran por nombre o tipo, o devuelven todo si la query está vacía", async () => {
    const res = await repo.search("pika");
    expect(res.length).toBeGreaterThan(0);
    const all = await repo.search("");
    expect(all.length).toBeGreaterThan(0);
    const resOpt = await repo.searchOptimized("char");
    expect(resOpt.length).toBeGreaterThan(0);
  });

  it("getByType devuelve solo los pokemon del tipo especificado", async () => {
    const fire = await repo.getByType("fire");
    expect(fire.length).toBeGreaterThan(0);
    expect(fire.every((p) => p.types.map((t) => String(t).toLowerCase()).includes("fire"))).toBe(true);
  });

  it("getCustomForms devuelve el array de formas personalizadas", async () => {
    const forms = await repo.getCustomForms();
    expect(Array.isArray(forms)).toBe(true);
  }, 10000);

  it("getByBstRange filtra correctamente por rango de BST", async () => {
    const range = await repo.getByBstRange(300, 400);
    expect(range.length).toBeGreaterThan(0);
    expect(range.every((p) => p.bst>=300 && p.bst<=400)).toBe(true);
  });
});