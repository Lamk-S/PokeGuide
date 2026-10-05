import { describe, it, expect } from "vitest";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

describe("normalizeId", () => {
  it("debe manejar y normalizar strings correctamente", () => {
    // Convierte a minúsculas
    expect(normalizeId("Pikachu")).toBe("pikachu");
    
    // Reemplaza espacios por guiones
    expect(normalizeId("Tapu Koko")).toBe("tapu-koko");
    
    // Mantiene los guiones y los pasa a minúsculas
    expect(normalizeId("Ho-Oh")).toBe("ho-oh");
    
    // Reemplaza múltiples espacios o guiones bajos por un solo guión
    expect(normalizeId("Mr. Mime")).toBe("mr.-mime");
    expect(normalizeId("tapu_lele")).toBe("tapu-lele");
    expect(normalizeId("multi   spaces")).toBe("multi-spaces");
  });

  it("debe retornar string vacío si recibe un valor vacío, nulo o undefined", () => {
    expect(normalizeId("")).toBe("");
    expect(normalizeId(null)).toBe("");
    expect(normalizeId(undefined)).toBe("");
  });
});