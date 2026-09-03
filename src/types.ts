export interface Document {
  id: string;
  name: string;
  content: string;
}

export interface SearchResult {
  documentId: string;
  score: number;
}
