import path from "node:path";
import { DocumentLoader } from "./document-loader.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeToken, normalizeTokens } from "./normalizer.js";

const dataDirectory = path.join(process.cwd(), "data");

const loader = new DocumentLoader(dataDirectory);

const documents = await loader.loadDocuments();

for (const document of documents) {
  const tokens = tokenizer(document.content);
  const normalized = normalizeTokens(tokens);

  console.log(document.name);
  console.log(tokens);
  console.log(normalized);
}

// console.log(documents);
