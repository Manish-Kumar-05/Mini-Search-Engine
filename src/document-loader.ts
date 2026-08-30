import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Document } from "./types.js";

export class DocumentLoader {
  constructor(private readonly dataDirectory: string) {}

  async loadDocuments(): Promise<Document[]> {
    const files = await readdir(this.dataDirectory);

    const documents: Document[] = [];

    for (const file of files) {
      if (!file.endsWith(".txt")) {
        continue;
      }

      const filePath = path.join(this.dataDirectory, file);

      const content = await readFile(filePath, "utf-8");

      documents.push({
        id: file,
        name: file,
        content,
      });
    }

    return documents;
  }
}

// return [
//     {
//         id: "apple.txt",
//         name: "apple.txt",
//         content: "Apple is a fruit..."
//     },
//     {
//         id: "banana.txt",
//         name: "banana.txt",
//         content: "Banana is a fruit..."
//     }
// ];
