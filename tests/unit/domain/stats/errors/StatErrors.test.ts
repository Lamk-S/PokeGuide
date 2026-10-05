import { describe, it, expect } from "vitest";
import { 
  StatDomainError, 
  InvalidIVError, 
  InvalidEVError, 
  InvalidLevelError 
} from "@/domain/stats/errors/StatErrors";

describe("StatErrors", () => {
  it("StatDomainError debe heredar de Error y establecer el nombre correctamente", () => {
    const error = new StatDomainError("Error base de stats");
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Error base de stats");
    expect(error.name).toBe("StatDomainError");
  });

  it("InvalidIVError debe heredar de StatDomainError y tener su propio nombre", () => {
    const error = new InvalidIVError("IV fuera de rango");
    expect(error).toBeInstanceOf(StatDomainError);
    expect(error.message).toBe("IV fuera de rango");
    expect(error.name).toBe("InvalidIVError");
  });

  it("InvalidEVError debe heredar de StatDomainError y tener su propio nombre", () => {
    const error = new InvalidEVError("EV excede el límite");
    expect(error).toBeInstanceOf(StatDomainError);
    expect(error.message).toBe("EV excede el límite");
    expect(error.name).toBe("InvalidEVError");
  });

  it("InvalidLevelError debe heredar de StatDomainError y tener su propio nombre", () => {
    const error = new InvalidLevelError("Nivel inválido");
    expect(error).toBeInstanceOf(StatDomainError);
    expect(error.message).toBe("Nivel inválido");
    expect(error.name).toBe("InvalidLevelError");
  });
});