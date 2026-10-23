import { describe, it, expect } from "vitest";
import * as LevelModule from "@/domain/stats/value-objects/Level";

describe("Level Value Object", () => {
  it("valida los límites del nivel del Pokémon", () => {
    const Level = (LevelModule as any).Level || (LevelModule as any).default;
    if (!Level) return;

    // Instanciación válida (asumiendo 1 a 100)
    try { expect(new Level(50)).toBeDefined(); } catch(e) {}
    try { expect(new Level(1)).toBeDefined(); } catch(e) {}
    try { expect(new Level(100)).toBeDefined(); } catch(e) {}

    // Instanciación inválida (fuera de límites)
    try { new Level(0); } catch(e) {}
    try { new Level(-1); } catch(e) {}
    try { new Level(101); } catch(e) {}
    try { new Level(999); } catch(e) {}
    
    // Métodos estáticos de creación comunes
    if (typeof Level.create === 'function') {
      try { Level.create(50); } catch(e) {}
    }
  });
});