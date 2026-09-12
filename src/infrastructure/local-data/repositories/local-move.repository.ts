import type { Move } from "@/domain/moves/types/move";
import dataset from "../../../../data/moves/dataset.json";

export class LocalMoveRepository {
  private moves = dataset as Move[];
  getAll = async (): Promise<Move[]> => this.moves;
  getByIds = async (ids: number[]): Promise<Move[]> =>
    this.moves.filter((m: Move) => ids.includes(m.id));
  getById = async (id: number): Promise<Move | undefined> =>
    this.moves.find((m: Move) => m.id === id);
}
