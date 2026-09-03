import { InvalidLevelError } from "../errors/StatErrors";

export class Level {
  private constructor(public readonly value: number) {}

  static create(value: number): Level {
    const parsed = Math.floor(value);
    if (parsed < 1 || parsed > 100) {
      throw new InvalidLevelError(
        `El nivel debe estar entre 1 y 100. Recibido: ${value}`,
      );
    }
    return new Level(parsed);
  }
}
