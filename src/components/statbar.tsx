import { PokemonStat } from "@/lib/types";
import { Progress } from "./ui/progress";

const StatBar: React.FC<{ stat: PokemonStat }> = ({ stat }) => (
  <div className="mb-2">
    <p className="text-sm">
      {stat.stat.name}: {stat.base_stat}
    </p>
    <Progress value={stat.base_stat} max={255} className="h-2" />
  </div>
);

export default StatBar;
