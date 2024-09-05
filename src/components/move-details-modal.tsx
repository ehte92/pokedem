import React from 'react';

import { Crosshair, RotateCcw, Siren, Target, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { typeColors } from '@/lib/constants';
import { MoveDetails } from '@/lib/types';

interface MoveDetailsModalProps {
  move: MoveDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const MoveDetailsModal: React.FC<MoveDetailsModalProps> = ({
  move,
  isOpen,
  onClose,
}) => {
  if (!move) return null;

  const getStatColor = (value: number | null, max: number) => {
    if (value === null) return 'bg-gray-300';
    const percentage = (value / max) * 100;
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold capitalize flex items-center justify-between">
            {move.name.replace('-', ' ')}
            <div className="flex space-x-2">
              <Badge
                className={`${typeColors[move.type.name]} text-white text-sm`}
              >
                {move.type.name}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {move.damage_class.name}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-1">Power</p>
              <Progress
                value={move.power}
                max={200}
                className={`h-2 ${getStatColor(move.power, 200)}`}
              />
              <p className="text-sm mt-1">{move.power || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Accuracy</p>
              <Progress
                value={move.accuracy}
                max={100}
                className={`h-2 ${getStatColor(move.accuracy, 100)}`}
              />
              <p className="text-sm mt-1">
                {move.accuracy ? `${move.accuracy}%` : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Zap className="w-6 h-6 mb-1 text-yellow-500" />
              <p className="text-sm font-semibold">PP</p>
              <p className="text-sm">{move.pp}</p>
            </div>
            <div className="flex flex-col items-center">
              <Target className="w-6 h-6 mb-1 text-blue-500" />
              <p className="text-sm font-semibold">Priority</p>
              <p className="text-sm">{move.priority}</p>
            </div>
            <div className="flex flex-col items-center">
              <Crosshair className="w-6 h-6 mb-1 text-green-500" />
              <p className="text-sm font-semibold">Target</p>
              <p className="text-xs capitalize">
                {move.target.name.replace('-', ' ')}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">Effect</h3>
            <p className="text-sm">{move.effect_entries[0]?.effect}</p>
            {move.effect_chance && (
              <p className="text-sm mt-2">
                <span className="font-semibold">Effect Chance:</span>{' '}
                {move.effect_chance}%
              </p>
            )}
          </div>

          {move.meta && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Additional Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  {move.meta.ailment.name !== 'none' && (
                    <div className="flex items-center">
                      <Siren className="w-5 h-5 mr-2 text-red-500" />
                      <div>
                        <p className="text-sm font-semibold">Ailment</p>
                        <p className="text-sm capitalize">
                          {move.meta.ailment.name.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                  )}
                  {(move.meta.min_hits || move.meta.max_hits) && (
                    <div className="flex items-center">
                      <RotateCcw className="w-5 h-5 mr-2 text-purple-500" />
                      <div>
                        <p className="text-sm font-semibold">Hits</p>
                        <p className="text-sm">
                          {move.meta.min_hits || 1}-{move.meta.max_hits || 1}
                        </p>
                      </div>
                    </div>
                  )}
                  {move.meta.drain !== 0 && (
                    <div>
                      <p className="text-sm font-semibold">Drain</p>
                      <p className="text-sm">{move.meta.drain}%</p>
                    </div>
                  )}
                  {move.meta.healing !== 0 && (
                    <div>
                      <p className="text-sm font-semibold">Healing</p>
                      <p className="text-sm">{move.meta.healing}%</p>
                    </div>
                  )}
                  {move.meta.crit_rate !== 0 && (
                    <div>
                      <p className="text-sm font-semibold">Crit Rate</p>
                      <p className="text-sm">+{move.meta.crit_rate}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoveDetailsModal;
