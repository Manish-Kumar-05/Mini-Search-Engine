# Mini Search Engine

A TypeScript-based search engine built from scratch to understand the core concepts behind information retrieval and modern search systems.

The project implements document indexing, Boolean search, phrase search, TF-IDF and BM25 ranking, query expansion, spell correction, result highlighting, index persistence, REST APIs, automated testing, search evaluation, and performance benchmarking.

---

## Features

- Document loading
- Tokenization
- Text normalization
- Stop-word removal
- Inverted index
- Positional index
- Boolean search
- Phrase search
- Query processing
- TF-IDF ranking
- BM25 ranking
- Query expansion
- Spell correction
- Search result highlighting
- Index persistence
- REST API
- Automated testing
- Search evaluation
- Performance benchmarking

---

# Architecture

```text
                    DOCUMENT COLLECTION
                            │
                            ▼
                    DOCUMENT LOADER
                            │
                            ▼
                       TOKENIZER
                            │
                            ▼
                      NORMALIZER
                            │
                            ▼
                   STOP-WORD REMOVAL
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
          INVERTED INDEX       POSITIONAL INDEX
                 │                     │
                 └──────────┬──────────┘
                            ▼
                    QUERY PROCESSING
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
         BOOLEAN         PHRASE         RANKING
          SEARCH         SEARCH            │
                                           │
                                    ┌──────┴──────┐
                                    ▼             ▼
                                  TF-IDF         BM25
                                    │             │
                                    └──────┬──────┘
                                           ▼
                                    QUERY EXPANSION
                                           │
                                           ▼
                                    SPELL CORRECTION
                                           │
                                           ▼
                                   RESULT HIGHLIGHTING
                                           │
                                           ▼
                                        REST API
```

---

# Search Pipeline

The search engine processes documents through the following pipeline:

```text
Raw Documents
      ↓
Document Loader
      ↓
Tokenization
      ↓
Normalization
      ↓
Stop-word Removal
      ↓
Index Construction
      ↓
User Query
      ↓
Query Processing
      ↓
Search
      ↓
Ranking
      ↓
Result Highlighting
```

---

# Core Components

## 1. Document Loader

The document loader reads documents from the `data/` directory and converts them into the internal document representation used by the search engine.

Example:

```text
data/
├── python.txt
├── javascript.txt
├── typescript.txt
├── machine-learning.txt
└── databases.txt
```

---

## 2. Tokenization

Tokenization converts document text into individual tokens.

Example:

```text
Python is a programming language
```

becomes:

```text
["Python", "is", "a", "programming", "language"]
```

---

## 3. Normalization

Normalization converts tokens into a consistent representation.

For example:

```text
Python
PYTHON
python
```

are normalized to:

```text
python
```

Punctuation is also removed.

---

## 4. Stop-word Removal

Common words that provide little search value can be removed before indexing.

For example:

```text
python is a programming language
```

can be reduced to terms such as:

```text
python
programming
language
```

This reduces unnecessary index entries and improves retrieval efficiency.

---

# Indexing

## Inverted Index

The inverted index maps terms to documents containing those terms.

Example:

```text
python
 ├── python.txt
 └── machine-learning.txt

javascript
 ├── javascript.txt
 └── typescript.txt

database
 └── databases.txt
```

This allows the search engine to retrieve matching documents without scanning every document for every query.

---

## Positional Index

The positional index stores the positions of terms within documents.

This enables phrase search.

For example:

```text
"machine learning"
```

requires the engine to determine whether:

```text
machine
```

is immediately followed by:

```text
learning
```

in a document.

---

# Search Features

## Boolean Search

The search engine supports Boolean operators.

### AND

```text
python AND machine
```

Returns documents containing both terms.

### OR

```text
python OR javascript
```

Returns documents containing either term.

### NOT

```text
NOT javascript
```

Returns documents that do not contain JavaScript.

### Parentheses

```text
(python OR javascript) AND machine
```

Parentheses control the logical grouping of expressions.

For example:

```text
python OR javascript AND programming
```

is interpreted according to operator precedence.

Whereas:

```text
(python OR javascript) AND programming
```

explicitly requires `programming` along with either `python` or `javascript`.

---

# Phrase Search

Phrase search finds terms occurring next to each other in the specified order.

Example:

```text
"machine learning"
```

The positional index is used to determine whether the phrase occurs in a document.

This is different from a normal query such as:

```text
machine learning
```

where the individual terms are searched rather than requiring the exact phrase.

---

# Ranking

The search engine currently implements two lexical ranking algorithms:

- TF-IDF
- BM25

---

## TF-IDF

TF-IDF stands for:

```text
Term Frequency × Inverse Document Frequency
```

It considers how frequently a term occurs in a document and how rare the term is across the document collection.

A simplified representation is:

```text
TF-IDF = TF × IDF
```

Terms that are frequent in a document but uncommon across the collection receive higher importance.

---

## BM25

BM25 is a probabilistic information-retrieval ranking algorithm.

It considers:

- Term frequency
- Inverse document frequency
- Document length
- Term-frequency saturation

The implementation produces a relevance score for every matching document.

BM25 generally provides more sophisticated lexical ranking behavior than basic TF-IDF.

---

# Query Processing

Queries are processed before being passed to the search engine.

The query-processing pipeline handles tasks such as:

```text
Raw Query
    ↓
Tokenization
    ↓
Normalization
    ↓
Stop-word Handling
    ↓
Query Parsing
    ↓
Search
```

The query parser also supports Boolean expressions and parentheses.

---

# Query Expansion

The current implementation uses a manually defined synonym dictionary.

Example:

```text
car
 ├── automobile
 └── vehicle

computer
 ├── pc
 └── machine

programming
 ├── coding
 └── development

database
 └── db

javascript
 └── js

typescript
 └── ts
```

The current approach is intentionally simple and rule-based.

A future implementation could evolve into:

```text
Manual Dictionary
       ↓
Word Embeddings
       ↓
Semantic Similarity
       ↓
ML/NLP-Based Query Expansion
```

This would allow the search engine to understand semantic relationships rather than relying only on manually defined synonyms.

---

# Spell Correction

The search engine implements basic spell correction using Levenshtein distance.

Example:

```text
javasript
    ↓
javascript
```

The spell corrector compares the query term against terms present in the index and finds a close candidate.

The implementation currently performs lexical similarity rather than semantic correction.

---

# Result Highlighting

Search results can be highlighted to make matching terms easier to identify.

Conceptually:

```text
Python is a programming language
^^^^^^
```

This can be used by the API or frontend to display matching terms more clearly.

---

# Index Persistence

The search engine supports exporting the generated indexes to disk.

The persisted index is stored in:

```text
storage/
└── index.json
```

The stored state can contain information such as:

- Inverted index
- Positional index
- Document metadata

This provides a foundation for loading a previously generated index instead of rebuilding everything from scratch.

---

# REST API

The search engine is exposed through an Express REST API.

## Base URL

```text
http://localhost:3000
```

---

## Health Check

### Request

```http
GET /api/health
```

### Response

```json
{
  "success": true,
  "message": "Search engine API is healthy"
}
```

---

## Root Endpoint

### Request

```http
GET /
```

### Response

```json
{
  "success": true,
  "message": "Mini Search Engine API"
}
```

---

## Search Endpoint

The search endpoint is implemented through the API routes in:

```text
src/api/routes/search.routes.ts
```

The exact route and request parameters should be checked against the current implementation before deployment.

---

# Project Structure

```text
Mini-search-engine/
│
├── data/
│   ├── python.txt
│   ├── javascript.txt
│   ├── typescript.txt
│   ├── machine-learning.txt
│   └── databases.txt
│
├── storage/
│   └── index.json
│
├── src/
│   │
│   ├── api/
│   │   ├── app.ts
│   │   └── routes/
│   │       └── search.routes.ts
│   │
│   ├── benchmark.ts
│   ├── document-loader.ts
│   ├── evaluation.ts
│   ├── evaluation-dataset.ts
│   ├── index-storage.ts
│   ├── inverted-index.ts
│   ├── levenshtein.ts
│   ├── main.ts
│   ├── normalizer.ts
│   ├── positional-index.ts
│   ├── query-expander.ts
│   ├── query-parser.ts
│   ├── query-processor.ts
│   ├── run-evaluation.ts
│   ├── search-engine.ts
│   ├── spell-corrector.ts
│   ├── stop-words.ts
│   ├── tokenizer.ts
│   └── types.ts
│
├── tests/
│   ├── boolean.test.ts
│   ├── inverted-index.test.ts
│   ├── normalizer.test.ts
│   ├── phrase.test.ts
│   ├── query-expansion.test.ts
│   ├── ranking.test.ts
│   ├── search.test.ts
│   ├── spell-corrector.test.ts
│   ├── stop-words.test.ts
│   └── tokenizer.test.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

---

# Installation

Clone the repository and install the dependencies:

```bash
npm install
```

---

# Running the Project

## Development

Start the development server:

```bash
npm run dev
```

---

# Testing

Run the complete test suite:

```bash
npm run test:run
```

Current test result:

```text
Test Files: 10 passed
Tests:      26 passed
```

The test suite covers:

- Tokenization
- Normalization
- Stop words
- Inverted index
- Search
- Boolean search
- Phrase search
- Query expansion
- Spell correction
- Ranking

---

# Evaluation

The search engine evaluates retrieval quality using:

- Precision@K
- Recall@K
- F1@K

Run:

```bash
npm run evaluate
```

---

## Evaluation Metrics

### Precision@K

Precision measures how many retrieved documents are relevant.

```text
Precision@K =
Relevant Retrieved Documents
/
Retrieved Documents
```

### Recall@K

Recall measures how many of the relevant documents were retrieved.

```text
Recall@K =
Relevant Retrieved Documents
/
Total Relevant Documents
```

### F1@K

F1 combines precision and recall.

```text
F1 =
2 × Precision × Recall
/
(Precision + Recall)
```

---

## Current Evaluation Results

Based on the current evaluation dataset:

| Metric      | TF-IDF |  BM25 |
| ----------- | -----: | ----: |
| Precision@3 |  0.533 | 0.533 |
| Recall@3    |  0.833 | 0.833 |
| F1@3        |  0.633 | 0.633 |

These results are based on a small manually labeled dataset.

The identical aggregate scores do not mean TF-IDF and BM25 produce identical rankings or scores. They can rank documents differently while still producing the same Precision@3, Recall@3, and F1@3.

These numbers should therefore be treated as a project baseline rather than a general comparison between the algorithms.

---

# Benchmarking

The project includes a scalability benchmark.

Run:

```bash
npm run benchmark
```

The benchmark measures:

- Document indexing time
- TF-IDF search latency
- BM25 search latency
- TF-IDF queries per second
- BM25 queries per second
- Number of returned results

---

## Current Benchmark Results

The current scalability benchmark was run with:

```text
5 documents
50 documents
500 documents
```

Current output:

| Documents | Indexing |   TF-IDF |     BM25 | TF-IDF QPS | BM25 QPS |
| --------: | -------: | -------: | -------: | ---------: | -------: |
|         5 | 1.120 ms | 0.799 ms | 1.132 ms |     38,797 |    8,795 |
|        50 | 0.681 ms | 0.073 ms | 0.260 ms |     13,722 |    4,544 |
|       500 | 8.802 ms | 1.345 ms | 8.083 ms |      1,240 |      211 |

The results show that search latency increases as the document collection grows.

The benchmark also shows that the current TF-IDF implementation is faster than BM25 for this implementation and dataset.

These values are environment-dependent and should not be treated as universal performance measurements.

---

# Benchmark Interpretation

The benchmark demonstrates an important property of search systems:

```text
More Documents
      ↓
Larger Index
      ↓
More Search Work
      ↓
Higher Latency
```

At small document counts, the search engine is extremely fast because the dataset is small.

As the number of documents increases, search performance decreases.

A production search engine would require additional optimizations such as:

- Better index structures
- Caching
- Efficient memory management
- Parallel processing
- Distributed indexing
- Sharding
- Specialized search infrastructure

---

# NPM Scripts

The project provides scripts for common development tasks.

```bash
npm run dev
```

Starts the development environment.

```bash
npm run test:run
```

Runs the complete test suite.

```bash
npm run evaluate
```

Runs search-quality evaluation.

```bash
npm run benchmark
```

Runs the performance and scalability benchmark.

---

# Example Searches

## Basic Search

```text
python
```

## Multiple Terms

```text
python machine learning
```

## Boolean AND

```text
python AND machine
```

## Boolean OR

```text
python OR javascript
```

## Boolean NOT

```text
python AND NOT javascript
```

## Parentheses

```text
(python OR javascript) AND programming
```

## Phrase

```text
"machine learning"
```

## Misspelled Query

```text
javasript
```

The spell-correction component can identify:

```text
javascript
```

as a close indexed term.

---

# Technologies

The project uses:

- TypeScript
- Node.js
- Express
- Vitest
- tsx

---

# Learning Objectives

This project was created to understand the internal concepts behind search engines and information retrieval systems.

The main concepts implemented are:

```text
Document Processing
       ↓
Tokenization
       ↓
Normalization
       ↓
Indexing
       ↓
Query Processing
       ↓
Information Retrieval
       ↓
Ranking
       ↓
Evaluation
       ↓
Performance Benchmarking
       ↓
REST API
```

The project focuses on implementing these concepts directly rather than relying entirely on an external search engine.

---

# Limitations

This is an educational search engine implementation and is not intended to compete with production search systems.

Current limitations include:

- Small document collection
- Basic document loading
- Local index storage
- Basic manual query expansion
- Basic spell correction
- No semantic/vector search
- No embeddings
- No neural ranking
- No learning-to-rank
- No distributed indexing
- No crawler
- No sharding
- No production-scale load testing

---

# Future Improvements

The project can be extended with:

## 1. Word Embeddings

Use embeddings to represent terms and documents as vectors.

```text
Words
 ↓
Embeddings
 ↓
Vector Representation
```

## 2. Semantic Search

Allow queries to retrieve documents based on meaning rather than exact terms.

## 3. Hybrid Search

Combine lexical and semantic retrieval:

```text
BM25
  +
Vector Similarity
  ↓
Hybrid Ranking
```

## 4. Advanced Query Expansion

Replace the manual synonym dictionary with:

```text
Manual Dictionary
       ↓
Word Embeddings
       ↓
Semantic Similarity
       ↓
ML/NLP Query Expansion
```

## 5. Learning-to-Rank

Use machine learning to learn the best ranking function from search data.

## 6. Query Autocomplete

Provide suggestions while the user types.

## 7. Query Suggestions

Suggest related queries based on previous searches or indexed content.

## 8. Better Spell Correction

Use language models and contextual information instead of only edit distance.

## 9. Larger Dataset

Test the search engine with thousands or millions of documents.

## 10. Distributed Search

Split the index across multiple machines and implement distributed retrieval.

---

# Development Roadmap

```text
Core Search Engine
        ↓
Testing
        ↓
Evaluation
        ↓
Benchmarking
        ↓
Documentation
        ↓
Docker
        ↓
Production Configuration
        ↓
Deployment
        ↓
Portfolio/GitHub Optimization
        ↓
Semantic Search
        ↓
Hybrid Search
```

---

# Why This Project Matters

A basic CRUD application demonstrates application development.

This project demonstrates additional understanding of:

- Data structures
- Algorithms
- Information retrieval
- Search indexing
- Ranking algorithms
- Query parsing
- Performance measurement
- API development
- Automated testing
- System design

The project therefore serves as a practical implementation of search-engine fundamentals rather than a simple CRUD application.

---

# License

MIT
