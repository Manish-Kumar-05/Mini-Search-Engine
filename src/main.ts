import path from "node:path";
import { DocumentLoader } from "./document-loader.js";

const dataDirectory = path.join(process.cwd(), "data");

const loader = new DocumentLoader(dataDirectory);

const documents = await loader.loadDocuments();

console.log(documents);
