import type { Move } from "@/domain/moves/types/move";
import datasetEs from "../../../../data/moves/dataset.es.json";

type MoveWithEs = Move & {
  id?: number;
  nameEs?: string;
  type?: string;
  damageClass?: string;
  power?: number | null;
  accuracy?: number | null;
  pp?: number | null;
};

export class LocalMoveRepository {
  private readonly moves: MoveWithEs[];
  private readonly byName: Map<string, MoveWithEs>;
  private readonly byId: Map<number, MoveWithEs>;

  constructor() {
    this.moves = datasetEs as MoveWithEs[];
    this.byName = new Map(this.moves.map((m) => [m.name.toLowerCase(), m]));
    this.byId = new Map(
      this.moves
        .filter((m) => typeof m.id === "number")
        .map((m) => [m.id as number, m]),
    );
  }

  async getAll(): Promise<MoveWithEs[]> {
    return [...this.moves];
  }

  async getByName(name: string): Promise<MoveWithEs | null> {
    return this.byName.get(name.toLowerCase().trim()) ?? null;
  }

  async getById(id: number): Promise<MoveWithEs | null> {
    return this.byId.get(id) ?? null;
  }

  async search(query: string): Promise<MoveWithEs[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [...this.moves];
    return this.moves.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.nameEs?.toLowerCase().includes(q) ||
        m.type?.toLowerCase().includes(q),
    );
  }

  async getByType(type: string): Promise<MoveWithEs[]> {
    const t = type.toLowerCase().trim();
    return this.moves.filter((m) => m.type?.toLowerCase() === t);
  }

  async getByDamageClass(damageClass: string): Promise<MoveWithEs[]> {
    const dc = damageClass.toLowerCase().trim();
    return this.moves.filter((m) => m.damageClass?.toLowerCase() === dc);
  }
}
