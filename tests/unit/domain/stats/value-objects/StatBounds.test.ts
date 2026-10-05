import { describe, it, expect } from "vitest";
import { Level } from "@/domain/stats/value-objects/Level";
import { IV } from "@/domain/stats/value-objects/IV";
import { EV } from "@/domain/stats/value-objects/EV";

describe("Stat Value Objects - Validaciones de límites", () => {
  it("Level debe lanzar error si está fuera del rango permitido", () => {
    expect(() => Level.create(0)).toThrow();
    expect(() => Level.create(101)).toThrow();
  });

  it("IV debe normalizar el valor si es menor a 0 o mayor a 31", () => {
    expect(IV.create(-1)).toBe(0);
    expect(IV.create(32)).toBe(31);
  });

  it("EV debe normalizar el valor si es menor a 0 o excede el límite individual", () => {
    const emptySet = EV.createEmptySet();
    
    expect(EV.create(-1, 'hp' as any, emptySet)).toBe(0);
    expect(EV.create(256, 'hp' as any, emptySet)).toBe(252); 
  });
});