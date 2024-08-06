import { typeColors } from "@/lib/constants";
import { Badge } from "./ui/badge";

const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <Badge className={`${typeColors[type] || "bg-gray-500"} text-white mr-1`}>
    {type}
  </Badge>
);

export default TypeBadge;
