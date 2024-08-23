import { fetchMoveDetails } from '@/lib/api';
import { typeEffectiveness } from '@/lib/constants';
import { calculateDamage, doesMoveHit } from '@/lib/pokemon-utils';
import {
  MoveDetails,
  PokemonBattleState,
  TypeEffectiveness,
} from '@/lib/types';

interface MoveHistoryEntry {
  moveName: string;
  effectiveness: number;
}

export class BattleAI {
  private aiPokemon: PokemonBattleState;
  private opponentPokemon: PokemonBattleState;
  private aiTeam: PokemonBattleState[];
  private moveHistory: MoveHistoryEntry[] = [];

  constructor(
    aiPokemon: PokemonBattleState,
    opponentPokemon: PokemonBattleState,
    aiTeam: PokemonBattleState[]
  ) {
    this.aiPokemon = aiPokemon;
    this.opponentPokemon = opponentPokemon;
    this.aiTeam = aiTeam;
  }

  async decideBestMove(): Promise<string> {
    const moves = await Promise.all(
      this.aiPokemon.moves
        .slice(0, 4)
        .map((move) => fetchMoveDetails(move.move.name))
    );

    const predictedOpponentMove = await this.predictOpponentMove();
    const scoredMoves = await Promise.all(
      moves.map(async (move) => ({
        move,
        score: await this.evaluateMove(move, predictedOpponentMove),
      }))
    );

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move.name;
  }

  private async evaluateMove(
    move: MoveDetails,
    predictedOpponentMove: MoveDetails | null
  ): Promise<number> {
    let score = 0;

    // Consider damage
    if (move.power) {
      const [damage, isCritical] = calculateDamage(
        this.aiPokemon,
        this.opponentPokemon,
        move
      );
      score += damage;
      if (isCritical) score += 20;
    }

    // Consider accuracy
    score *= (move.accuracy || 100) / 100;

    // Consider type effectiveness
    const effectiveness = this.calculateTypeEffectiveness(
      move.type.name,
      this.opponentPokemon.types[0].type.name
    );
    score *= effectiveness;

    // Consider predicted opponent move
    if (predictedOpponentMove) {
      if (this.isDefensiveMove(move) && predictedOpponentMove.power) {
        score += 50; // Bonus for using a defensive move against an offensive move
      }
    }

    // Consider status effects
    if (move.meta?.ailment?.name !== 'none') {
      score += 30;
    }

    // Consider stat changes
    move.stat_changes.forEach((change) => {
      score += change.change * 10;
    });

    return score;
  }

  private calculateTypeEffectiveness(
    attackType: string,
    defenseType: string
  ): number {
    return (
      (typeEffectiveness as TypeEffectiveness)[attackType]?.[defenseType] || 1
    );
  }

  private isDefensiveMove(move: MoveDetails): boolean {
    return move.stat_changes.some(
      (change) =>
        (change.stat.name === 'defense' ||
          change.stat.name === 'special-defense') &&
        change.change > 0
    );
  }

  async recordOpponentMove(moveName: string): Promise<void> {
    const moveDetails = await fetchMoveDetails(moveName);
    const effectiveness = this.calculateMoveEffectiveness(moveDetails);
    this.moveHistory.push({ moveName, effectiveness });
    if (this.moveHistory.length > 5) {
      this.moveHistory.shift(); // Keep only the last 5 moves
    }
  }

  private calculateMoveEffectiveness(move: MoveDetails): number {
    const effectiveness = this.calculateTypeEffectiveness(
      move.type.name,
      this.aiPokemon.types[0].type.name
    );
    return move.power ? effectiveness * move.power : effectiveness;
  }

  private async predictOpponentMove(): Promise<MoveDetails | null> {
    if (this.moveHistory.length === 0) return null;

    // Simple prediction: choose the move with the highest average effectiveness
    const moveEffectiveness: {
      [key: string]: { total: number; count: number };
    } = {};
    this.moveHistory.forEach((entry) => {
      if (!moveEffectiveness[entry.moveName]) {
        moveEffectiveness[entry.moveName] = { total: 0, count: 0 };
      }
      moveEffectiveness[entry.moveName].total += entry.effectiveness;
      moveEffectiveness[entry.moveName].count++;
    });

    let bestMove = null;
    let highestAverage = 0;
    for (const [moveName, stats] of Object.entries(moveEffectiveness)) {
      const average = stats.total / stats.count;
      if (average > highestAverage) {
        highestAverage = average;
        bestMove = moveName;
      }
    }

    return bestMove ? await fetchMoveDetails(bestMove) : null;
  }

  private getMaxHP(pokemon: PokemonBattleState): number {
    return (
      pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat || 100
    );
  }

  shouldSwitchPokemon(): boolean {
    const currentEffectiveness = this.calculateOverallTypeEffectiveness(
      this.aiPokemon,
      this.opponentPokemon
    );
    const aiHpPercentage =
      this.aiPokemon.currentHP / this.getMaxHP(this.aiPokemon);

    // Check if there's a better Pokémon to switch to
    const betterPokemon = this.aiTeam.find((pokemon) => {
      if (pokemon === this.aiPokemon || pokemon.currentHP === 0) return false;
      const pokemonEffectiveness = this.calculateOverallTypeEffectiveness(
        pokemon,
        this.opponentPokemon
      );
      return pokemonEffectiveness > currentEffectiveness;
    });

    // Decide to switch if current Pokémon is at a type disadvantage or low on HP
    return (
      (currentEffectiveness < 1 && betterPokemon !== undefined) ||
      aiHpPercentage < 0.2
    );
  }

  getBestSwitchOption(): PokemonBattleState | null {
    const availablePokemon = this.aiTeam.filter(
      (pokemon) => pokemon !== this.aiPokemon && pokemon.currentHP > 0
    );

    if (availablePokemon.length === 0) return null;

    return availablePokemon.reduce((best, pokemon) => {
      const effectiveness = this.calculateOverallTypeEffectiveness(
        pokemon,
        this.opponentPokemon
      );
      const currentBestEffectiveness = this.calculateOverallTypeEffectiveness(
        best,
        this.opponentPokemon
      );

      if (effectiveness > currentBestEffectiveness) return pokemon;
      if (
        effectiveness === currentBestEffectiveness &&
        pokemon.currentHP > best.currentHP
      )
        return pokemon;
      return best;
    });
  }

  private calculateOverallTypeEffectiveness(
    attacker: PokemonBattleState,
    defender: PokemonBattleState
  ): number {
    let totalEffectiveness = 0;
    attacker.types.forEach((attackerType) => {
      defender.types.forEach((defenderType) => {
        totalEffectiveness += this.calculateTypeEffectiveness(
          attackerType.type.name,
          defenderType.type.name
        );
      });
    });
    return totalEffectiveness / (attacker.types.length * defender.types.length);
  }
}
