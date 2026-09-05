import { InvertedIndex } from "./inverted-index.js";
import { Tfidf } from "./tf-idf.js";

export function createDocumentVector(
  index: InvertedIndex,
  documentId: string,
  vocabulary: string[]
): number[] {
  const tfidf = new Tfidf(index);

  return vocabulary.map((term) => tfidf.calculate(term, documentId));
}
