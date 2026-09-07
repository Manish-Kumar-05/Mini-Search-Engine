import { levenshteinDistance } from "./levenshtein.js";

export class SpellCorrector {
  constructor(private readonly vocabulary: string[]) {}

  findClosestTerm(term: string, maxDistance = 2): string | null {
    let closestTerm: string | null = null;
    let closestDistance = Infinity;

    for (const candidate of this.vocabulary) {
      const distance = levenshteinDistance(term, candidate);

      if (distance <= maxDistance && distance < closestDistance) {
        closestDistance = distance;
        closestTerm = candidate;
      }
    }

    return closestTerm;
  }
}
