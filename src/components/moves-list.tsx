import React from 'react';

import { typeColors } from '@/lib/constants';
import { MoveDetails } from '@/lib/types';

import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface MovesListProps {
  moves: MoveDetails[];
}

const MovesList: React.FC<MovesListProps> = ({ moves }) => {
  if (moves.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No moves found matching the current filters.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {moves.map((move) => (
        <Card key={move.id} className="overflow-hidden">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2 capitalize">
              {move.name.replace('-', ' ')}
            </h3>
            <div className="flex space-x-2 mb-2">
              <Badge className={`${typeColors[move.type.name]} text-white`}>
                {move.type.name}
              </Badge>
              <Badge variant="outline">{move.damage_class.name}</Badge>
            </div>
            <p className="text-sm mb-1">Power: {move.power || 'N/A'}</p>
            <p className="text-sm mb-1">Accuracy: {move.accuracy || 'N/A'}</p>
            <p className="text-sm mb-1">PP: {move.pp}</p>
            <p className="text-sm">{move.effect_entries[0]?.short_effect}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MovesList;
