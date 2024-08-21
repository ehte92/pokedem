import { fetchMoveDetails } from '@/lib/api';
import { typeEffectiveness } from '@/lib/constants';
import { MoveDetails, PokemonDetails, PokemonType } from '@/lib/types';

interface ScoredMove {
  move: MoveDetails;
  score: number;
}

export async function selectBestMoves(
  pokemon: PokemonDetails
): Promise<MoveDetails[]> {
  const allMoves = await Promise.all(
    pokemon.moves.map(async (move) => {
      try {
        return await fetchMoveDetails(move.move.name);
      } catch (error) {
        console.error(
          `Error fetching details for move ${move.move.name}:`,
          error
        );
        return null;
      }
    })
  );

  const validMoves = allMoves.filter(
    (move): move is MoveDetails => move !== null
  );

  const scoredMoves: ScoredMove[] = validMoves.map((move) => ({
    move,
    score: scoreMoveForPokemon(move, pokemon.types),
  }));

  const selectedMoves: MoveDetails[] = [];
  let damageMovesCount = 0;
  let statusMovesCount = 0;

  // Sort moves by score, descending
  scoredMoves.sort((a, b) => b.score - a.score);

  for (const scoredMove of scoredMoves) {
    if (selectedMoves.length >= 4) break;

    if (scoredMove.move.power) {
      if (damageMovesCount < 3) {
        selectedMoves.push(scoredMove.move);
        damageMovesCount++;
      }
    } else {
      if (statusMovesCount < 1) {
        selectedMoves.push(scoredMove.move);
        statusMovesCount++;
      }
    }
  }

  // If we don't have 4 moves yet, fill with the highest scored remaining moves
  for (const scoredMove of scoredMoves) {
    if (selectedMoves.length >= 4) break;
    if (!selectedMoves.includes(scoredMove.move)) {
      selectedMoves.push(scoredMove.move);
    }
  }

  return selectedMoves;
}

function scoreMoveForPokemon(
  move: MoveDetails,
  pokemonTypes: PokemonType[]
): number {
  let score = 0;

  // Base score on power
  if (move.power) {
    score += move.power;

    // Consider type effectiveness
    const avgEffectiveness = calculateAverageTypeEffectiveness(move.type.name);
    score *= avgEffectiveness;
  }

  // Consider accuracy
  score *= (move.accuracy || 100) / 100;

  // Bonus for STAB (Same Type Attack Bonus)
  if (pokemonTypes.some((type) => type.type.name === move.type.name)) {
    score *= 1.5;
  }

  // Bonus for status effects
  if (move.meta && move.meta.ailment && move.meta.ailment.name !== 'none') {
    score += 20;
  }

  // Bonus for stat changes
  if (move.stat_changes) {
    move.stat_changes.forEach((change) => {
      score += Math.abs(change.change) * 10;
    });
  }

  // Slight bonus for priority moves
  if (move.priority) {
    score += move.priority * 5;
  }

  // Bonus for moves with additional effects
  if (move.meta) {
    if (move.meta.drain || move.meta.healing || move.meta.crit_rate) {
      score += 15;
    }
  }

  return score;
}

function calculateAverageTypeEffectiveness(moveType: string): number {
  const effectivenessValues = Object.values(typeEffectiveness[moveType] || {});
  if (effectivenessValues.length === 0) return 1;

  const sum = effectivenessValues.reduce((acc, val) => acc + val, 0);
  return sum / effectivenessValues.length;
}
