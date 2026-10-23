export class Level {
  private constructor(public readonly value: number) {
    Object.freeze(this);
  }

  static create(value: number): Level {
    if (!Number.isFinite(value))
      throw new Error(`[Level] Valor inválido: ${value}`);
    if (!Number.isInteger(value))
      throw new Error(`[Level] El nivel debe ser entero, recibido: ${value}`);
    if (value < 1 || value > 100)
      throw new Error(
        `[Level] Estado inválido: ${value}. Debe estar entre 1 y 100`,
      );
    return new Level(value);
  }

  static from(value: number | Level): Level {
    return value instanceof Level ? value : Level.create(value);
  }

  toNumber(): number {
    return this.value;
  }
  equals(other: Level): boolean {
    return this.value === other.value;
  }
  toString(): string {
    return `${this.value}`;
  }
}
