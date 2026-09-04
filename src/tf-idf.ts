export function calculateIdf(
  totalDocuments: number,
  documentFrequency: number
): number {
  if (documentFrequency === 0) {
    return 0;
  }

  //   smoothing
  return Math.log(1 + totalDocuments / documentFrequency);
}
