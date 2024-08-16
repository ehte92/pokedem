import { fetchMoveDetails } from '@/lib/api';
import { typeEffectiveness } from '@/lib/constants';
import {
  MoveDetails,
  PokemonBattleState,
  TypeEffectiveness,
} from '@/lib/types';

export class BattleAI {
  private aiPokemon: PokemonBattleState;
  private opponentPokemon: PokemonBattleState;
  private aiTeam: PokemonBattleState[];

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

    const scoredMoves = await Promise.all(
      moves.map(async (move) => ({
        move,
        score: await this.evaluateMove(move),
      }))
    );

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move.name;
  }

  private async evaluateMove(move: MoveDetails): Promise<number> {
    let score = 0;

    // Consider damage
    if (move.power) {
      const effectiveness = this.calculateTypeEffectiveness(
        move.type.name,
        this.opponentPokemon.types[0].type.name
      );
      score += move.power * effectiveness;
    }

    // Consider accuracy
    score *= (move.accuracy || 100) / 100;

    // Consider status effects
    if (move.meta.ailment.name !== 'none') {
      score += 20; // Bonus for status-inducing moves
    }

    // Consider stat changes
    move.stat_changes.forEach((change) => {
      score += change.change * 10;
    });

    // Consider current HP
    const aiHpPercentage =
      this.aiPokemon.currentHP / this.getMaxHP(this.aiPokemon);
    if (aiHpPercentage < 0.3 && move.meta.healing > 0) {
      score += 50; // Prioritize healing when low on HP
    }

    // Consider type advantages for damage moves
    if (move.power) {
      const stab = this.aiPokemon.types.some(
        (type) => type.type.name === move.type.name
      )
        ? 1.5
        : 1;
      score *= stab;
    }

    // Consider opponent's status
    if (this.opponentPokemon.status) {
      score += 10; // Slight bonus if opponent already has a status condition
    }

    // Consider AI Pokemon's status
    if (this.aiPokemon.status) {
      score -= 10; // Slight penalty if AI Pokemon has a status condition
    }

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
