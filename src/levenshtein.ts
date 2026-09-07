// We'll implement Levenshtein distance.

// It measures the minimum number of:

// insertions
// deletions
// substitutions

// needed to change one word into another.

export function levenshteinDistance(first: string, second: string): number {
  const rows = first.length + 1;
  const columns = second.length + 1;

  const matrix: number[][] = [];

  for (let i = 0; i < rows; i++) {
    matrix[i] = [];

    for (let j = 0; j < columns; j++) {
      matrix[i][j] = 0;
    }
  }

  // Transform empty string into second string
  for (let i = 0; i < rows; i++) {
    matrix[i][0] = i;
  }

  // Transform empty string into first string
  for (let j = 0; j < columns; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < columns; j++) {
      const cost = first[i - 1] === second[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[first.length][second.length];
}
