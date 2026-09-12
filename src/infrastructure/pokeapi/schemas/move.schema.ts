import { z } from "zod";
export const moveSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.object({ name: z.string() }),
  power: z.number().nullable(),
  accuracy: z.number().nullable(),
  pp: z.number().nullable(),
  damage_class: z.object({ name: z.string() }),
  names: z.array(
    z.object({ name: z.string(), language: z.object({ name: z.string() }) }),
  ),
});
export type PokeApiMoveDto = z.infer<typeof moveSchema>;
