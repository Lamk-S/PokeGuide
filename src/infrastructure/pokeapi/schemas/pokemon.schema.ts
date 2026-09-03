import { z } from "zod";

// DTO que representa estrictamente lo que nos interesa del JSON gigante de PokeAPI
export const pokeApiStatSchema = z.object({
  base_stat: z.number().nonnegative(),
  stat: z.object({
    name: z.enum([
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed",
    ]),
  }),
});

export const pokeApiTypeSchema = z.object({
  type: z.object({
    name: z.string(),
  }),
});

export const pokeApiPokemonSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
  height: z.number().nonnegative(),
  weight: z.number().nonnegative(),
  stats: z.array(pokeApiStatSchema),
  types: z.array(pokeApiTypeSchema),
});

export type PokeApiPokemonDto = z.infer<typeof pokeApiPokemonSchema>;
