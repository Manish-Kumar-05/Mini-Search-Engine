export function cosineSimilarity(first: number[], second: number[]): number {
  if (first.length !== second.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (let i = 0; i < first.length; i++) {
    dotProduct += first[i] * second[i];

    firstMagnitude += first[i] * first[i];

    secondMagnitude += second[i] * second[i];
  }

  if (firstMagnitude === 0 || secondMagnitude === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(firstMagnitude) * Math.sqrt(secondMagnitude));
}
