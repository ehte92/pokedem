import React, { useEffect, useState } from 'react';

import {
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import { POKEMON_TYPES, TYPE_EFFECTIVENESS } from '@/lib/constants';

interface DataPoint {
  x: number;
  y: number;
  z: number;
  attackType: string;
  defenseType: string;
}

const TypeChart = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768; // Adjust this breakpoint as needed

  const data = POKEMON_TYPES.flatMap((attackType, y) =>
    POKEMON_TYPES.map((defenseType, x) => ({
      x,
      y,
      z: TYPE_EFFECTIVENESS[attackType][defenseType],
      attackType,
      defenseType,
    }))
  );

  const getEffectivenessColor = (effectiveness: number) => {
    switch (effectiveness) {
      case 0:
        return '#6B7280';
      case 0.25:
        return '#B91C1C';
      case 0.5:
        return '#EF4444';
      case 1:
        return '#E5E7EB';
      case 2:
        return '#10B981';
      case 4:
        return '#047857';
      default:
        return '#E5E7EB';
    }
  };

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DataPoint;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg text-xs sm:text-sm">
          <p>{`${data.attackType} → ${data.defenseType}`}</p>
          <p className="font-bold">{`Effectiveness: ${data.z}x`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[400px] sm:h-[600px] md:h-[800px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: isMobile ? 5 : 20,
            bottom: isMobile ? 60 : 100,
            left: isMobile ? 60 : 80,
          }}
        >
          <XAxis
            type="number"
            dataKey="x"
            name="Defense Type"
            ticks={POKEMON_TYPES.map((_, index) => index)}
            tickFormatter={(index) =>
              isMobile ? POKEMON_TYPES[index].slice(0, 3) : POKEMON_TYPES[index]
            }
            interval={0}
            tick={{ fontSize: isMobile ? 8 : 10, fill: '#4B5563' }}
            angle={isMobile ? -90 : -45}
            textAnchor="end"
            height={isMobile ? 60 : 80}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Attack Type"
            ticks={POKEMON_TYPES.map((_, index) => index)}
            tickFormatter={(index) =>
              isMobile ? POKEMON_TYPES[index].slice(0, 3) : POKEMON_TYPES[index]
            }
            interval={0}
            tick={{ fontSize: isMobile ? 8 : 10, fill: '#4B5563' }}
            width={isMobile ? 50 : 70}
            reversed
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[isMobile ? 40 : 60, isMobile ? 40 : 60]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={data}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getEffectivenessColor(entry.z)}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TypeChart;
