export type MoveId = number;
export interface Move {
  id: MoveId;
  name: string;
  nameEs: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  damageClass: "physical" | "special" | "status";
}
