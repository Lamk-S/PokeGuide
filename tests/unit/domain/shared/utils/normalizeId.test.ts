import { describe, it, expect } from "vitest";
import { normalizeId, normalizeAbilityId, normalizeItemId } from "@/domain/shared/utils/normalizeId";

describe("Utils: normalizeId module", () => {
  describe("normalizeId", () => {
    it("normaliza strings correctamente eliminando espacios y guiones bajos", () => {
      expect(normalizeId("Thunderbolt")).toBe("thunderbolt");
      expect(normalizeId("Tapu Koko")).toBe("tapu-koko");
      expect(normalizeId(" Ho-Oh ")).toBe("ho-oh");
      expect(normalizeId("Porygon-Z")).toBe("porygon-z");
      expect(normalizeId("heavy_duty_boots")).toBe("heavy-duty-boots");
      expect(normalizeId("will  o   wisp")).toBe("will-o-wisp");
      expect(normalizeId("will--o--wisp")).toBe("will-o-wisp");
    });

    it("maneja valores vacíos o falsy de forma segura", () => {
      expect(normalizeId("")).toBe("");
      expect(normalizeId(undefined)).toBe("");
      expect(normalizeId(null)).toBe("");
    });
  });

  describe("normalizeAbilityId", () => {
    it("reutiliza la normalización para habilidades", () => {
      expect(normalizeAbilityId("Mold Breaker")).toBe("mold-breaker");
      expect(normalizeAbilityId(null)).toBe("");
    });
  });

  describe("normalizeItemId", () => {
    it("reutiliza la normalización para items", () => {
      expect(normalizeItemId("Choice Specs")).toBe("choice-specs");
      expect(normalizeItemId(undefined)).toBe("");
    });
  });
});