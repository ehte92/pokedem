import React from "react";
import { PokemonListItem, PokemonDetails } from "@/lib/types";
import Image from "next/image";
import { useQuery } from "react-query";
import { fetchPokemonDetails } from "@/lib/api";

interface PokemonListCardProps {
  pokemon: PokemonListItem;
  onClick: () => void;
}

const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

const PokemonListCard: React.FC<PokemonListCardProps> = ({
  pokemon,
  onClick,
}) => {
  const pokemonId = pokemon.url.split("/")[6];
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

  const { data: pokemonDetails, isLoading } = useQuery<PokemonDetails>(
    ["pokemonDetails", pokemonId],
    () => fetchPokemonDetails(pokemonId),
    {
      staleTime: Infinity,
    }
  );

  const mainType = pokemonDetails?.types[0]?.type.name || "normal";
  const bgColor = typeColors[mainType as keyof typeof typeColors] || "#A8A878";

  return (
    <div
      onClick={onClick}
      className="relative w-64 h-96 m-4 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:rotate-1 group font-pixel"
      style={{
        background: `linear-gradient(135deg, ${bgColor}99 0%, ${bgColor}44 100%)`,
        boxShadow: `0 4px 20px ${bgColor}66`,
      }}
    >
      {/* Pokéball background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full opacity-20 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full opacity-20 transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Card content */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-bold text-white pixel-text uppercase leading-tight max-w-[70%] break-words">
            {pokemon.name}
          </h3>
          <p className="text-white text-opacity-90 text-xs font-bold bg-white bg-opacity-20 px-2 py-1 rounded pixel-text">
            #{pokemonId.padStart(3, "0")}
          </p>
        </div>

        {/* Image */}
        <div className="relative w-32 h-32 mx-auto mb-4 group">
          <div className="absolute inset-0 bg-white rounded-full opacity-25 group-hover:animate-ping"></div>
          <Image
            src={imageUrl}
            alt={pokemon.name}
            width={128}
            height={128}
            className="drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 pixelated"
          />
        </div>

        {/* Types */}
        {isLoading ? (
          <p className="text-center text-white pixel-text text-xs">
            Loading types...
          </p>
        ) : (
          <div className="flex justify-center gap-2 mb-2">
            {pokemonDetails?.types.map((type) => (
              <span
                key={type.type.name}
                className="px-2 py-1 rounded-full text-xs font-bold text-white shadow-md pixel-text uppercase"
                style={{
                  backgroundColor:
                    typeColors[type.type.name as keyof typeof typeColors],
                }}
              >
                {type.type.name}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-white text-opacity-90">
          <div className="text-center">
            <p className="text-[10px] pixel-text">HEIGHT</p>
            <p className="text-xs font-bold pixel-text">
              {pokemonDetails?.height ?? "??"} m
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] pixel-text">WEIGHT</p>
            <p className="text-xs font-bold pixel-text">
              {pokemonDetails?.weight ?? "??"} kg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonListCard;
