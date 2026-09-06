import path from "node:path";
import { DocumentLoader } from "./document-loader.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeToken, normalizeTokens } from "./normalizer.js";
import { InvertedIndex } from "./inverted-index.js";
import { removeStopWords } from "./stop-words.js";
import { SearchEngine } from "./search-engine.js";
import { precisionAtK } from "./evaluation.js";
import { QueryProcessor } from "./query-processor.js";
import { QueryParser } from "./query-parser.js";
import { PositionalIndex } from "./positional-index.js";

const dataDirectory = path.join(process.cwd(), "data");

const loader = new DocumentLoader(dataDirectory);

const documents = await loader.loadDocuments();
const index = new InvertedIndex();

const positionalIndex = new PositionalIndex();

for (const document of documents) {
  const tokens = tokenizer(document.content);

  const normalizedTokens = normalizeTokens(tokens);

  // Used for phrase search
  positionalIndex.addDocument(document.id, normalizedTokens);

  // Used for normal keyword search
  const filteredTokens = removeStopWords(normalizedTokens);

  index.addDocument(document.id, filteredTokens);
}

const searchEngine = new SearchEngine(index, positionalIndex);
const queryProcessor = new QueryProcessor();
const parser = new QueryParser();

const evaluationQueries = [
  {
    query: "python machine learning",
    relevantDocuments: ["python.txt", "machine-learning.txt"],
  },
  {
    query: "javascript programming",
    relevantDocuments: ["javascript.txt", "typescript.txt"],
  },
  {
    query: "database data",
    relevantDocuments: ["databases.txt"],
  },
];

// console.log(searchEngine.searchPhrase("Python"));

// console.log(searchEngine.searchPhrase("machine learning allows"));

// console.log(searchEngine.searchPhrase("programming language"));

// for (const evaluation of evaluationQueries) {
//   const tfidfResults = searchEngine.searchRanked(evaluation.query);

//   const bm25Results = searchEngine.searchBM25(evaluation.query);

//   const tfidfPrecision = precisionAtK(
//     tfidfResults,
//     evaluation.relevantDocuments,
//     3
//   );

//   const bm25Precision = precisionAtK(
//     bm25Results,
//     evaluation.relevantDocuments,
//     3
//   );

//   console.log("\nQuery:", evaluation.query);

//   console.log("TF-IDF:", tfidfResults);

//   console.log("TF-IDF Precision@3:", tfidfPrecision);

//   console.log("BM25:", bm25Results);

//   console.log("BM25 Precision@3:", bm25Precision);
// }

// console.log(queryProcessor.process("Python, MACHINE learning!"));

// console.log(JSON.stringify(parser.parse("python and Machine"), null, 2));

// console.log(searchEngine.searchRanked("python"));

// console.log(searchEngine.searchRanked("python machine"));

// console.log(searchEngine.searchRanked("python machine learning"));

// console.log("BM25:");

// console.log(searchEngine.searchBM25("python machine"));

// console.log(searchEngine.searchBM25("python machine learning"));

// console.log(index.getDocumentLength("python.txt"));

// console.log(index.getDocumentLength("machine-learning.txt"));

// console.log(searchEngine.searchRanked("javascript database python"));

console.log(searchEngine.search("python"));
console.log(searchEngine.search("python AND machine"));
console.log(searchEngine.search("python OR javascript"));
console.log(searchEngine.search("NOT machine"));
console.log(searchEngine.search("python AND machine AND learning"));
console.log(searchEngine.search("python OR javascript AND programming")); //Find documents that contain Python, OR documents that contain both JavaScript and programming.
console.log(searchEngine.search("(python OR javascript) AND machine")); //Find documents that contain machine and also contain either Python or JavaScript.
console.log(searchEngine.search("python AND NOT javascript"));

// console.log(searchEngine.search("Manish"));
// console.log(searchEngine.search("   "));

// console.log(index.getDocuments("python"));
// console.log(index.getDocuments("programming"));
// console.log(index.getDocuments("typescript"));
// console.log(index.getDocuments("is"));

// console.log(documents);
