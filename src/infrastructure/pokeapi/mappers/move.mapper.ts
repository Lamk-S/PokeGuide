import type { PokeApiMoveDto } from "../schemas/move.schema";
import type { Move } from "@/domain/moves/types/move";

export function mapMove(dto: PokeApiMoveDto): Move {
  const nameEs =
    dto.names.find((n) => n.language.name === "es")?.name ?? dto.name;
  return {
    id: dto.id,
    name: dto.name,
    nameEs,
    type: dto.type.name,
    power: dto.power,
    accuracy: dto.accuracy,
    pp: dto.pp ?? 0,
    damageClass: dto.damage_class.name as Move["damageClass"],
  };
}
