import { performance } from "node:perf_hooks";

import { InvertedIndex } from "./inverted-index.js";
import { PositionalIndex } from "./positional-index.js";
import { SearchEngine } from "./search-engine.js";

import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { removeStopWords } from "./stop-words.js";

type BenchmarkDocument = {
  id: string;
  name: string;
  content: string;
};

// ==========================================
// DOCUMENT TEMPLATES
// ==========================================

const templates = [
  {
    name: "Python",
    content:
      "python programming language software development backend scripting",
  },
  {
    name: "JavaScript",
    content: "javascript web development frontend browser programming",
  },
  {
    name: "TypeScript",
    content:
      "typescript javascript programming language static typing development",
  },
  {
    name: "Machine Learning",
    content: "machine learning artificial intelligence python algorithms data",
  },
  {
    name: "Database",
    content: "database sql storage data management backend query",
  },
  {
    name: "React",
    content: "react javascript frontend components user interface web",
  },
  {
    name: "Node",
    content: "node javascript backend server express api development",
  },
  {
    name: "Algorithms",
    content:
      "algorithms data structures sorting searching complexity programming",
  },
  {
    name: "Operating Systems",
    content: "operating systems processes memory scheduling threads computer",
  },
  {
    name: "Networking",
    content: "computer networks tcp ip http communication server internet",
  },
];

// ==========================================
// GENERATE DOCUMENTS
// ==========================================

function generateDocuments(count: number): BenchmarkDocument[] {
  const documents: BenchmarkDocument[] = [];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];

    documents.push({
      id: `document-${i}.txt`,

      name: `${template.name} ${i}`,

      content: `${template.content} document ${i}`,
    });
  }

  return documents;
}

// ==========================================
// BUILD SEARCH ENGINE
// ==========================================

function createSearchEngine(documents: BenchmarkDocument[]): SearchEngine {
  const index = new InvertedIndex();

  const positionalIndex = new PositionalIndex();

  for (const document of documents) {
    const tokens = tokenizer(document.content);

    const normalizedTokens = normalizeTokens(tokens);

    positionalIndex.addDocument(document.id, normalizedTokens);

    const filteredTokens = removeStopWords(normalizedTokens);

    index.addDocument(document.id, filteredTokens);
  }

  return new SearchEngine(index, positionalIndex, documents);
}

// ==========================================
// MEASURE SEARCH
// ==========================================

function measureSearch(searchFunction: () => unknown, iterations: number) {
  // Warm-up
  for (let i = 0; i < 20; i++) {
    searchFunction();
  }

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    searchFunction();
  }

  const end = performance.now();

  const totalTime = end - start;

  const averageTime = totalTime / iterations;

  const queriesPerSecond = iterations / (totalTime / 1000);

  return {
    averageTime,
    queriesPerSecond,
  };
}

// ==========================================
// BENCHMARK ONE DATASET
// ==========================================

function benchmark(documentCount: number) {
  const documents = generateDocuments(documentCount);

  // -----------------------------
  // INDEXING
  // -----------------------------

  const indexingStart = performance.now();

  const searchEngine = createSearchEngine(documents);

  const indexingEnd = performance.now();

  const indexingTime = indexingEnd - indexingStart;

  // -----------------------------
  // QUERY
  // -----------------------------

  const query = "python programming";

  const iterations = 1000;

  // -----------------------------
  // TF-IDF
  // -----------------------------

  const tfidf = measureSearch(() => {
    searchEngine.searchRanked(query);
  }, iterations);

  // -----------------------------
  // BM25
  // -----------------------------

  const bm25 = measureSearch(() => {
    searchEngine.searchBM25(query);
  }, iterations);

  // -----------------------------
  // RESULT COUNTS
  // -----------------------------

  const tfidfResults = searchEngine.searchRanked(query);

  const bm25Results = searchEngine.searchBM25(query);

  return {
    documentCount,
    indexingTime,

    tfidfAverage: tfidf.averageTime,

    bm25Average: bm25.averageTime,

    tfidfQPS: tfidf.queriesPerSecond,

    bm25QPS: bm25.queriesPerSecond,

    tfidfResults: tfidfResults.length,

    bm25Results: bm25Results.length,
  };
}

// ==========================================
// MAIN
// ==========================================

console.log("\n==============================================================");

console.log("              MINI SEARCH ENGINE BENCHMARK");

console.log("==============================================================\n");

console.log(
  "Documents".padEnd(12) +
    "Indexing".padEnd(16) +
    "TF-IDF".padEnd(16) +
    "BM25".padEnd(16) +
    "TF-IDF QPS".padEnd(16) +
    "BM25 QPS"
);

console.log("-".repeat(92));

const sizes = [5, 50, 500, 1000, 5000];

for (const size of sizes) {
  try {
    const result = benchmark(size);

    console.log(
      String(result.documentCount).padEnd(12) +
        `${result.indexingTime.toFixed(3)} ms`.padEnd(16) +
        `${result.tfidfAverage.toFixed(4)} ms`.padEnd(16) +
        `${result.bm25Average.toFixed(4)} ms`.padEnd(16) +
        `${result.tfidfQPS.toFixed(0)}`.padEnd(16) +
        `${result.bm25QPS.toFixed(0)}`
    );
  } catch (error) {
    console.error(`Benchmark failed for ${size} documents:`, error);
  }
}

console.log("\n==============================================================");

console.log("Benchmark complete.");

console.log("==============================================================\n");
