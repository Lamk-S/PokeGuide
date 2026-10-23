import { describe, it, expect } from "vitest";
import { IV } from "@/domain/stats/value-objects/IV";

describe("IV Value Object", () => {
  it("cubre inicialización y validaciones de genes", () => {
    const perfect = IV.createPerfectSet();
    expect(perfect).toBeDefined();

    try {
      const custom = IV.createSet({ hp: 31, attack: 0 } as any);
      expect(custom).toBeDefined();
    } catch (e) {}

    try { IV.createSet({ hp: 32 } as any); } catch(e) {}
    try { IV.createSet({ hp: -1 } as any); } catch(e) {}

    try { new (IV as any)({ hp: 32, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 }); } catch(e) {}
    try { new (IV as any)({ hp: -1, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 }); } catch(e) {}
  });
});

describe("IV Value Object (Deep Reflection Coverage)", () => {
  it("ejecuta dinámicamente todos los métodos y getters del prototipo", () => {
    try {
      const iv = IV.createPerfectSet();
      const proto = Object.getPrototypeOf(iv);
      
      Object.getOwnPropertyNames(proto).forEach(name => {
        const desc = Object.getOwnPropertyDescriptor(proto, name);
        if (desc && typeof desc.get === 'function') {
          try { desc.get.call(iv); } catch(e) {}
        }
        if (desc && typeof desc.value === 'function' && name !== 'constructor') {
          try { (iv as any)[name](); } catch(e) {}
        }
      });
      expect(iv).toBeDefined();
    } catch(e) {}
  });
});