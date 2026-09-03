import path from "node:path";
import { DocumentLoader } from "./document-loader.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeToken, normalizeTokens } from "./normalizer.js";
import { InvertedIndex } from "./inverted-index.js";
import { removeStopWords } from "./stop-words.js";
import { SearchEngine } from "./search-engine.js";

const dataDirectory = path.join(process.cwd(), "data");

const loader = new DocumentLoader(dataDirectory);

const documents = await loader.loadDocuments();
const index = new InvertedIndex();

for (const document of documents) {
  const tokens = tokenizer(document.content);

  const normalizedTokens = normalizeTokens(tokens);

  const filteredTokens = removeStopWords(normalizedTokens);

  index.addDocument(document.id, filteredTokens);
}
console.log(index.getTermFrequency("python", "python.txt"));

console.log(index.getTermFrequency("python", "machine-learning.txt"));

const searchEngine = new SearchEngine(index);

console.log(searchEngine.search("python"));

console.log(searchEngine.search("python AND machine"));

console.log(searchEngine.search("python OR javascript"));

console.log(searchEngine.search("python NOT machine"));

console.log(searchEngine.search("Manish"));
console.log(searchEngine.search("   "));

console.log(searchEngine.searchRanked("python"));

// console.log(index.getDocuments("python"));
// console.log(index.getDocuments("programming"));
// console.log(index.getDocuments("typescript"));
// console.log(index.getDocuments("is"));

// console.log(documents);
