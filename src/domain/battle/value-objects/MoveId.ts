export const MoveId = {
  FACADE: "facade",
  SHADOW_BALL: "shadow-ball",
  FLAMETHROWER: "flamethrower",
  THUNDERBOLT: "thunderbolt",
} as const;

export type MoveId = (typeof MoveId)[keyof typeof MoveId] | string;

/**
 * Normaliza un move name o label a ID interno
 */
export function normalizeMoveId(input: string | undefined): string | undefined {
  if (!input) return undefined;

  const lower = input.toLowerCase().trim();

  const moveMap: Record<string, string> = {
    // Facade
    facade: MoveId.FACADE,
    imagen: MoveId.FACADE,
    fachada: MoveId.FACADE,
    // Shadow Ball
    "shadow ball": MoveId.SHADOW_BALL,
    "bola sombra": MoveId.SHADOW_BALL,
    "bola de sombra": MoveId.SHADOW_BALL,
    // Flamethrower
    flamethrower: MoveId.FLAMETHROWER,
    lanzallamas: MoveId.FLAMETHROWER,
    llamarada: "flamethrower",
    // Thunderbolt
    thunderbolt: MoveId.THUNDERBOLT,
    rayo: MoveId.THUNDERBOLT,
    impactrueno: MoveId.THUNDERBOLT,
  };

  if (moveMap[lower]) {
    return moveMap[lower];
  }

  return lower.replace(/\s+/g, "-");
}

export function isFacadeMove(moveId: string | undefined): boolean {
  if (!moveId) return false;
  return normalizeMoveId(moveId) === MoveId.FACADE;
}
