import { buildSearchEngine } from "./search-engine-builder.js";
import { QueryProcessor } from "./query-processor.js";
import { QueryParser } from "./query-parser.js";
import { QueryExpander } from "./query-expander.js";
import { precisionAtK } from "./evaluation.js";

const searchEngine = await buildSearchEngine();

const queryProcessor = new QueryProcessor();

const parser = new QueryParser();

const expander = new QueryExpander();

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
| Manual tests
|--------------------------------------------------------------------------
*/

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
//     searchEngine.searchPhrase(
//         "machine learning allows"
//     )
// );

// console.log(
//     searchEngine.search(
//         "python AND machine"
//     )
// );

// console.log(
//     searchEngine.search(
//         "(python OR javascript) AND machine"
//     )
// );

// console.log(
//     searchEngine.highlightResults(
//         searchEngine.searchBM25("javascript"),
//         "javascript"
//     )
// );

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
//             "python AND machine"
//         ),
//         null,
//         2
//     )
// );

/*
|--------------------------------------------------------------------------
| Query expansion
|--------------------------------------------------------------------------
*/

// console.log(
//     expander.expand(["car"])
// );

/*
|--------------------------------------------------------------------------
| Evaluation
|--------------------------------------------------------------------------
*/

// for (const evaluation of evaluationQueries) {
//     const results =
//         searchEngine.searchBM25(
//             evaluation.query
//         );

//     const precision =
//         precisionAtK(
//             results,
//             evaluation.relevantDocuments,
//             3
//         );

//     console.log(
//         "\nQuery:",
//         evaluation.query
//     );

//     console.log(
//         "Results:",
//         results
//     );

//     console.log(
//         "Precision@3:",
//         precision
//     );
// }
