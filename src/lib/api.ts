import { EvolutionChain } from "./types";

export const fetchPokemonList = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to fetch Pokemon list");
  return response.json();
};

export const fetchPokemonDetails = async (name: string) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  if (!response.ok) throw new Error("Failed to fetch Pokemon details");
  return response.json();
};

export const fetchEvolutionChain = async (
  id: number
): Promise<EvolutionChain | null> => {
  try {
    const speciesResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`
    );
    if (!speciesResponse.ok) throw new Error("Failed to fetch Pokemon species");
    const speciesData = await speciesResponse.json();
    const evolutionResponse = await fetch(speciesData.evolution_chain.url);
    if (!evolutionResponse.ok)
      throw new Error("Failed to fetch evolution chain");
    return evolutionResponse.json();
  } catch (error) {
    console.error("Error fetching evolution chain:", error);
    return null; // Return null instead of throwing an error
  }
};
