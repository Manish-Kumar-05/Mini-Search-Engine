import { EvaluationQuery } from "./evaluation.js";

export const evaluationQueries: EvaluationQuery[] = [
  {
    query: "python",
    relevantDocuments: ["python.txt", "machine-learning.txt"],
  },

  {
    query: "machine learning",
    relevantDocuments: ["machine-learning.txt", "python.txt"],
  },

  {
    query: "javascript",
    relevantDocuments: ["javascript.txt", "typescript.txt"],
  },

  {
    query: "typescript",
    relevantDocuments: ["typescript.txt", "javascript.txt"],
  },

  {
    query: "programming",
    relevantDocuments: ["python.txt", "javascript.txt", "typescript.txt"],
  },

  {
    query: "programming language",
    relevantDocuments: ["python.txt", "javascript.txt", "typescript.txt"],
  },

  {
    query: "database",
    relevantDocuments: ["databases.txt"],
  },

  {
    query: "data",
    relevantDocuments: ["databases.txt"],
  },

  {
    query: "python machine learning",
    relevantDocuments: ["python.txt", "machine-learning.txt"],
  },

  {
    query: "javascript programming",
    relevantDocuments: ["javascript.txt", "typescript.txt"],
  },
];
