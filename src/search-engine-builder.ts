import path from "node:path";
import crypto from "node:crypto";

import { DocumentLoader } from "./document-loader.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { InvertedIndex } from "./inverted-index.js";
import { removeStopWords } from "./stop-words.js";
import { SearchEngine } from "./search-engine.js";
import { PositionalIndex } from "./positional-index.js";
import { IndexStorage } from "./index-storage.js";
import { Document } from "./types.js";

const INDEX_VERSION = 1;

export async function buildSearchEngine(): Promise<SearchEngine> {
  const dataDirectory = path.join(process.cwd(), "data");

  const storage = new IndexStorage(
    path.join(process.cwd(), "storage", "index.json")
  );

  const loader = new DocumentLoader(dataDirectory);

  const documents = await loader.loadDocuments();

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

  const index = new InvertedIndex();

  const positionalIndex = new PositionalIndex();

  const savedState = await storage.load<{
    version: number;
    documentFingerprint: string;
    invertedIndex: ReturnType<InvertedIndex["exportState"]>;
    positionalIndex: ReturnType<PositionalIndex["exportState"]>;
    documents: Document[];
  }>();

  let shouldBuildIndex = true;

  if (savedState) {
    const versionMatches = savedState.version === INDEX_VERSION;

    const documentsMatch =
      savedState.documentFingerprint === currentFingerprint;

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

  if (shouldBuildIndex) {
    for (const document of documents) {
      const tokens = tokenizer(document.content);

      const normalizedTokens = normalizeTokens(tokens);

      positionalIndex.addDocument(document.id, normalizedTokens);

      const filteredTokens = removeStopWords(normalizedTokens);

      index.addDocument(document.id, filteredTokens);
    }

    await storage.save({
      version: INDEX_VERSION,

      documentFingerprint: currentFingerprint,

      invertedIndex: index.exportState(),

      positionalIndex: positionalIndex.exportState(),

      documents,
    });

    console.log("Index built and saved to storage.");
  }

  return new SearchEngine(index, positionalIndex, documents);
}
