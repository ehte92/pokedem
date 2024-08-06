import { EvolutionChain as EvolutionChainType, EvolutionTo } from "@/lib/types";

const EvolutionChain: React.FC<{ chain: EvolutionChainType }> = ({ chain }) => {
  const renderEvolution = (
    evolution:
      | EvolutionTo
      | { species: { name: string }; evolves_to: EvolutionTo[] }
  ) => (
    <div key={evolution.species.name} className="flex flex-col items-center">
      <p>{evolution.species.name}</p>
      {evolution.evolves_to && evolution.evolves_to.length > 0 && (
        <div className="mt-2">{evolution.evolves_to.map(renderEvolution)}</div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {renderEvolution(chain.chain)}
    </div>
  );
};

export default EvolutionChain;
