export const MoveCategory = {
  PHYSICAL: "Physical",
  SPECIAL: "Special",
  STATUS: "Status",
} as const;

export type MoveCategory = (typeof MoveCategory)[keyof typeof MoveCategory];

export function isPhysicalCategory(category: MoveCategory): boolean {
  return category === MoveCategory.PHYSICAL;
}

export function isSpecialCategory(category: MoveCategory): boolean {
  return category === MoveCategory.SPECIAL;
}

export function isStatusCategory(category: MoveCategory): boolean {
  return category === MoveCategory.STATUS;
}
