import path from "node:path";
import crypto from "node:crypto";

import { DocumentLoader } from "./document-loader.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { InvertedIndex } from "./inverted-index.js";
import { removeStopWords } from "./stop-words.js";
import { SearchEngine } from "./search-engine.js";
import { precisionAtK } from "./evaluation.js";
import { QueryProcessor } from "./query-processor.js";
import { QueryParser } from "./query-parser.js";
import { PositionalIndex } from "./positional-index.js";
import { QueryExpander } from "./query-expander.js";
import { levenshteinDistance } from "./levenshtein.js";
import { SpellCorrector } from "./spell-corrector.js";
import { IndexStorage } from "./index-storage.js";
import { Document } from "./types.js";

const INDEX_VERSION = 1;

const dataDirectory = path.join(process.cwd(), "data");

const storage = new IndexStorage(
  path.join(process.cwd(), "storage", "index.json")
);

const loader = new DocumentLoader(dataDirectory);

/*
|--------------------------------------------------------------------------
| Load current documents
|--------------------------------------------------------------------------
|
| We always load the documents so that we can detect
| if a document has been added, removed, or modified.
|
*/

const documents = await loader.loadDocuments();

/*
|--------------------------------------------------------------------------
| Create document fingerprint
|--------------------------------------------------------------------------
|
| This creates a hash from the current documents.
| If document contents change, the fingerprint changes.
|
*/

function createDocumentFingerprint(documents: Document[]): string {
  const normalizedDocuments = [...documents]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((document) => ({
      id: document.id,
      name: document.name,
      content: document.content,
    }));

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(normalizedDocuments))
    .digest("hex");
}

const currentFingerprint = createDocumentFingerprint(documents);

/*
|--------------------------------------------------------------------------
| Create indexes
|--------------------------------------------------------------------------
*/

const index = new InvertedIndex();

const positionalIndex = new PositionalIndex();

/*
|--------------------------------------------------------------------------
| Load saved index
|--------------------------------------------------------------------------
*/

const savedState = await storage.load<{
  version: number;
  documentFingerprint: string;
  invertedIndex: ReturnType<InvertedIndex["exportState"]>;
  positionalIndex: ReturnType<PositionalIndex["exportState"]>;
  documents: Document[];
}>();

let shouldBuildIndex = true;

/*
|--------------------------------------------------------------------------
| Check whether saved index is valid
|--------------------------------------------------------------------------
*/

if (savedState) {
  const versionMatches = savedState.version === INDEX_VERSION;

  const documentsMatch = savedState.documentFingerprint === currentFingerprint;

  if (versionMatches && documentsMatch) {
    index.importState(savedState.invertedIndex);

    positionalIndex.importState(savedState.positionalIndex);

    shouldBuildIndex = false;

    console.log("Loaded index from storage.");
  } else {
    if (!versionMatches) {
      console.log("Index version changed. Rebuilding index...");
    }

    if (!documentsMatch) {
      console.log("Documents changed. Rebuilding index...");
    }
  }
}

/*
|--------------------------------------------------------------------------
| Build index when necessary
|--------------------------------------------------------------------------
*/

if (shouldBuildIndex) {
  for (const document of documents) {
    const tokens = tokenizer(document.content);

    const normalizedTokens = normalizeTokens(tokens);

    /*
     * Used for phrase search
     */
    positionalIndex.addDocument(document.id, normalizedTokens);

    /*
     * Used for normal keyword search
     */
    const filteredTokens = removeStopWords(normalizedTokens);

    index.addDocument(document.id, filteredTokens);
  }

  /*
    |--------------------------------------------------------------------------
    | Save index
    |--------------------------------------------------------------------------
    */

  await storage.save({
    version: INDEX_VERSION,

    documentFingerprint: currentFingerprint,

    invertedIndex: index.exportState(),

    positionalIndex: positionalIndex.exportState(),

    documents,
  });

  console.log("Index built and saved to storage.");
}

/*
|--------------------------------------------------------------------------
| Create SearchEngine
|--------------------------------------------------------------------------
*/

const searchEngine = new SearchEngine(index, positionalIndex, documents);

/*
|--------------------------------------------------------------------------
| Query tools
|--------------------------------------------------------------------------
*/

const queryProcessor = new QueryProcessor();

const parser = new QueryParser();

/*
|--------------------------------------------------------------------------
| Evaluation queries
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Search tests
|--------------------------------------------------------------------------
*/

// console.log(
//     searchEngine.searchPhrase("Python")
// );

// console.log(
//     searchEngine.searchPhrase(
//         "machine learning allows"
//     )
// );

// console.log(
//     searchEngine.searchPhrase(
//         "programming language"
//     )
// );

/*
|--------------------------------------------------------------------------
| Evaluation
|--------------------------------------------------------------------------
*/

// for (const evaluation of evaluationQueries) {
//     const tfidfResults =
//         searchEngine.searchRanked(
//             evaluation.query
//         );

//     const bm25Results =
//         searchEngine.searchBM25(
//             evaluation.query
//         );

//     const tfidfPrecision =
//         precisionAtK(
//             tfidfResults,
//             evaluation.relevantDocuments,
//             3
//         );

//     const bm25Precision =
//         precisionAtK(
//             bm25Results,
//             evaluation.relevantDocuments,
//             3
//         );

//     console.log(
//         "\nQuery:",
//         evaluation.query
//     );

//     console.log(
//         "TF-IDF:",
//         tfidfResults
//     );

//     console.log(
//         "TF-IDF Precision@3:",
//         tfidfPrecision
//     );

//     console.log(
//         "BM25:",
//         bm25Results
//     );

//     console.log(
//         "BM25 Precision@3:",
//         bm25Precision
//     );
// }

/*
|--------------------------------------------------------------------------
| Query processing
|--------------------------------------------------------------------------
*/

// console.log(
//     queryProcessor.process(
//         "Python, MACHINE learning!"
//     )
// );

// console.log(
//     JSON.stringify(
//         parser.parse(
//             "python and Machine"
//         ),
//         null,
//         2
//     )
// );

/*
|--------------------------------------------------------------------------
| TF-IDF ranking
|--------------------------------------------------------------------------
*/

// console.log(
//     searchEngine.searchRanked(
//         "python"
//     )
// );

// console.log(
//     searchEngine.searchRanked(
//         "python machine"
//     )
// );

// console.log(
//     searchEngine.searchRanked(
//         "python machine learning"
//     )
// );

/*
|--------------------------------------------------------------------------
| BM25 ranking
|--------------------------------------------------------------------------
*/

// console.log("BM25:");

// console.log(
//     searchEngine.searchBM25(
//         "python machine"
//     )
// );

// console.log(
//     searchEngine.searchBM25(
//         "python machine learning"
//     )
// );

/*
|--------------------------------------------------------------------------
| Document length
|--------------------------------------------------------------------------
*/

// console.log(
//     index.getDocumentLength(
//         "python.txt"
//     )
// );

// console.log(
//     index.getDocumentLength(
//         "machine-learning.txt"
//     )
// );

/*
|--------------------------------------------------------------------------
| Ranked search
|--------------------------------------------------------------------------
*/

// console.log(
//     searchEngine.searchRanked(
//         "javascript database python"
//     )
// );

/*
|--------------------------------------------------------------------------
| Boolean search
|--------------------------------------------------------------------------
*/

// console.log(
//     searchEngine.search(
//         "python"
//     )
// );

// console.log(
//     searchEngine.search(
//         "python AND machine"
//     )
// );

// console.log(
//     searchEngine.search(
//         "python OR javascript"
//     )
// );

// console.log(
//     searchEngine.search(
//         "NOT machine"
//     )
// );

// console.log(
//     searchEngine.search(
//         "python AND machine AND learning"
//     )
// );

// console.log(
//     searchEngine.search(
//         "python OR javascript AND programming"
//     )
// );

// console.log(
//     searchEngine.search(
//         "(python OR javascript) AND machine"
//     )
// );

// console.log(
//     searchEngine.search(
//         "python AND NOT javascript"
//     )
// );

/*
|--------------------------------------------------------------------------
| Query expansion
|--------------------------------------------------------------------------
*/

const expander = new QueryExpander();

// console.log(
//     expander.expand(["car"])
// );

/*
|--------------------------------------------------------------------------
| Edge cases
|--------------------------------------------------------------------------
*/

// console.log(
//     searchEngine.search(
//         "Manish"
//     )
// );

// console.log(
//     searchEngine.search(
//         "   "
//     )
// );

/*
|--------------------------------------------------------------------------
| Inverted index
|--------------------------------------------------------------------------
*/

// console.log(
//     index.getDocuments(
//         "python"
//     )
// );

// console.log(
//     index.getDocuments(
//         "programming"
//     )
// );

// console.log(
//     index.getDocuments(
//         "typescript"
//     )
// );

// console.log(
//     index.getDocuments(
//         "is"
//     )
// );

// console.log(
//     documents
// );

/*
|--------------------------------------------------------------------------
| Levenshtein distance
|--------------------------------------------------------------------------
*/

// console.log(
//     levenshteinDistance(
//         "pythn",
//         "python"
//     )
// );

// console.log(
//     levenshteinDistance(
//         "javasript",
//         "javascript"
//     )
// );

// console.log(
//     levenshteinDistance(
//         "kitten",
//         "sitting"
//     )
// );

/*
|--------------------------------------------------------------------------
| Spell correction
|--------------------------------------------------------------------------
*/

const spellCorrector = new SpellCorrector(index.getTerms());

// console.log(
//     spellCorrector.findClosestTerm(
//         "pythn"
//     )
// );

// console.log(
//     spellCorrector.findClosestTerm(
//         "javasript"
//     )
// );

/*
|--------------------------------------------------------------------------
| Spell-corrected search
|--------------------------------------------------------------------------
*/

// console.log(
//     searchEngine.search(
//         "python"
//     )
// );

// console.log(
//     searchEngine.search(
//         "pythn"
//     )
// );

// console.log(
//     searchEngine.search(
//         "pythn AND machine"
//     )
// );

// console.log(
//     searchEngine.search(
//         "javasript"
//     )
// );

/*
|--------------------------------------------------------------------------
| BM25 + highlighting
|--------------------------------------------------------------------------
*/

const results = searchEngine.searchBM25("javascript");

// console.log(
//     results
// );

const highlighted = searchEngine.highlightResults(results, "javascript");

// console.log(
//     highlighted
// );

/*
|--------------------------------------------------------------------------
| Typo + highlighting
|--------------------------------------------------------------------------
*/

const typoResults = searchEngine.searchBM25("pyton");

const typoHighlighted = searchEngine.highlightResults(typoResults, "pyton");

// console.log(
//     typoHighlighted
// );

/*
|--------------------------------------------------------------------------
| Query expansion + highlighting
|--------------------------------------------------------------------------
*/

// const expandedResults =
//     searchEngine.searchBM25(
//         "programming"
//     );

// const expandedHighlighted =
//     searchEngine.highlightResults(
//         expandedResults,
//         "programming"
//     );

// console.log(
//     expandedHighlighted
// );

/*
|--------------------------------------------------------------------------
| Final ranking tests
|--------------------------------------------------------------------------
*/

// console.log(
//     "=== NORMAL ==="
// );

// console.log(
//     searchEngine.searchBM25(
//         "javascript"
//     )
// );

// console.log(
//     "=== TYPO ==="
// );

// console.log(
//     searchEngine.searchBM25(
//         "javasript"
//     )
// );

// console.log(
//     "=== PHRASE ==="
// );

// console.log(
//     searchEngine.searchBM25(
//         "machine learning"
//     )
// );

// console.log(
//     "=== NAME ==="
// );

// console.log(
//     searchEngine.searchBM25(
//         "python"
//     )
// );

// console.log(
//     searchEngine.searchBM25(
//         "javascript"
//     )
// );

// console.log(
//     searchEngine.searchBM25(
//         "javasript"
//     )
// );

// console.log(
//     searchEngine.searchBM25(
//         "machine learning"
//     )
// );

/*
|--------------------------------------------------------------------------
| Phrase search
|--------------------------------------------------------------------------
*/

// console.log(
//     searchEngine.searchPhrase(
//         "used to store"
//     )
// );

/*
|--------------------------------------------------------------------------
| Result limit
|--------------------------------------------------------------------------
*/

// console.log(
//     searchEngine.searchBM25(
//         "python",
//         3
//     )
// );

console.log(searchEngine.searchBM25("artificial intelligence"));
