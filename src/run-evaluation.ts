import path from "node:path";

import { DocumentLoader } from "./document-loader.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { removeStopWords } from "./stop-words.js";

import { InvertedIndex } from "./inverted-index.js";
import { PositionalIndex } from "./positional-index.js";
import { SearchEngine } from "./search-engine.js";

import { precisionAtK, recallAtK, f1AtK } from "./evaluation.js";

import { evaluationQueries } from "./evaluation-dataset.js";

const dataDirectory = path.join(process.cwd(), "data");

const loader = new DocumentLoader(dataDirectory);

const documents = await loader.loadDocuments();

const index = new InvertedIndex();

const positionalIndex = new PositionalIndex();

for (const document of documents) {
  const tokens = tokenizer(document.content);

  const normalizedTokens = normalizeTokens(tokens);

  positionalIndex.addDocument(document.id, normalizedTokens);

  const filteredTokens = removeStopWords(normalizedTokens);

  index.addDocument(document.id, filteredTokens);
}

const searchEngine = new SearchEngine(index, positionalIndex, documents);

const K = 3;

console.log("\n==============================");
console.log("     SEARCH ENGINE EVALUATION");
console.log("==============================\n");

let totalTFIDFPrecision = 0;
let totalTFIDFRecall = 0;
let totalTFIDFF1 = 0;

let totalBM25Precision = 0;
let totalBM25Recall = 0;
let totalBM25F1 = 0;

for (const evaluation of evaluationQueries) {
  const { query, relevantDocuments } = evaluation;

  const tfidfResults = searchEngine.searchRanked(query);

  const bm25Results = searchEngine.searchBM25(query);

  const tfidfPrecision = precisionAtK(tfidfResults, relevantDocuments, K);

  const tfidfRecall = recallAtK(tfidfResults, relevantDocuments, K);

  const tfidfF1 = f1AtK(tfidfResults, relevantDocuments, K);

  const bm25Precision = precisionAtK(bm25Results, relevantDocuments, K);

  const bm25Recall = recallAtK(bm25Results, relevantDocuments, K);

  const bm25F1 = f1AtK(bm25Results, relevantDocuments, K);

  totalTFIDFPrecision += tfidfPrecision;
  totalTFIDFRecall += tfidfRecall;
  totalTFIDFF1 += tfidfF1;

  totalBM25Precision += bm25Precision;
  totalBM25Recall += bm25Recall;
  totalBM25F1 += bm25F1;

  console.log(`Query: "${query}"`);

  console.log("\nTF-IDF");
  console.log("Results:", tfidfResults);
  console.log("Precision@3:", tfidfPrecision.toFixed(3));
  console.log("Recall@3:", tfidfRecall.toFixed(3));
  console.log("F1@3:", tfidfF1.toFixed(3));

  console.log("\nBM25");
  console.log("Results:", bm25Results);
  console.log("Precision@3:", bm25Precision.toFixed(3));
  console.log("Recall@3:", bm25Recall.toFixed(3));
  console.log("F1@3:", bm25F1.toFixed(3));

  console.log("\n------------------------------\n");
}

const queryCount = evaluationQueries.length;

console.log("==============================");
console.log("          AVERAGE");
console.log("==============================\n");

console.log("TF-IDF");
console.log("Precision@3:", (totalTFIDFPrecision / queryCount).toFixed(3));

console.log("Recall@3:", (totalTFIDFRecall / queryCount).toFixed(3));

console.log("F1@3:", (totalTFIDFF1 / queryCount).toFixed(3));

console.log("\nBM25");

console.log("Precision@3:", (totalBM25Precision / queryCount).toFixed(3));

console.log("Recall@3:", (totalBM25Recall / queryCount).toFixed(3));

console.log("F1@3:", (totalBM25F1 / queryCount).toFixed(3));

console.log("\n==============================");

const avgTFIDFPrecision = totalTFIDFPrecision / queryCount;

const avgTFIDFRecall = totalTFIDFRecall / queryCount;

const avgTFIDFF1 = totalTFIDFF1 / queryCount;

const avgBM25Precision = totalBM25Precision / queryCount;

const avgBM25Recall = totalBM25Recall / queryCount;

const avgBM25F1 = totalBM25F1 / queryCount;

console.log("\n==============================");
console.log("       TF-IDF vs BM25");
console.log("==============================\n");

console.log("Metric".padEnd(20), "TF-IDF".padEnd(12), "BM25");

console.log(
  "Precision@3".padEnd(20),
  avgTFIDFPrecision.toFixed(3).padEnd(12),
  avgBM25Precision.toFixed(3)
);

console.log(
  "Recall@3".padEnd(20),
  avgTFIDFRecall.toFixed(3).padEnd(12),
  avgBM25Recall.toFixed(3)
);

console.log(
  "F1@3".padEnd(20),
  avgTFIDFF1.toFixed(3).padEnd(12),
  avgBM25F1.toFixed(3)
);

console.log("\nConclusion:");

if (avgBM25F1 > avgTFIDFF1) {
  console.log("BM25 performs better on this dataset.");
} else if (avgTFIDFF1 > avgBM25F1) {
  console.log("TF-IDF performs better on this dataset.");
} else {
  console.log(
    "Both algorithms have identical evaluation metrics on this dataset."
  );
}
