# Mini Search Engine API

REST API for the Mini Search Engine.

## Base URL

```text
http://localhost:3000
```

## Endpoints

### 1. API Information

```http
GET /api
```

Returns available API endpoints.

---

### 2. Health Check

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "Search engine API is healthy"
}
```

---

### 3. Search

```http
GET /api/search
```

#### Query Parameters

| Parameter | Required | Default | Description            |
| --------- | -------- | ------- | ---------------------- |
| `q`       | Yes      | —       | Search query           |
| `mode`    | No       | `bm25`  | Search algorithm       |
| `limit`   | No       | `10`    | Maximum results, 1–100 |

#### Search Modes

- `bm25` — Ranked keyword search using BM25
- `boolean` — Boolean search using `AND`, `OR`, `NOT`, and parentheses
- `phrase` — Exact consecutive phrase search

### BM25 Example

```http
GET /api/search?q=javascript&mode=bm25
```

### Boolean Example

```http
GET /api/search?q=python%20AND%20machine&mode=boolean
```

### Phrase Example

```http
GET /api/search?q=machine%20learning&mode=phrase
```

### Limit Example

```http
GET /api/search?q=python&limit=3
```

### Successful Response

```json
{
  "success": true,
  "data": {
    "query": "javascript",
    "mode": "bm25",
    "count": 2,
    "results": [
      {
        "documentId": "javascript.txt",
        "score": 1.23,
        "snippet": "<mark>JavaScript</mark> is a programming language..."
      }
    ]
  }
}
```

## Error Responses

### Missing Query

```http
GET /api/search
```

```json
{
  "success": false,
  "message": "Search query is required"
}
```

### Invalid Mode

```json
{
  "success": false,
  "message": "Invalid search mode",
  "validModes": ["bm25", "boolean", "phrase"]
}
```

### Invalid Limit

```json
{
  "success": false,
  "message": "Limit must be between 1 and 100"
}
```

## Search Pipeline

```text
HTTP Request
     ↓
Query Validation
     ↓
Query Processing
     ↓
Spell Correction
     ↓
Query Expansion
     ↓
Search Algorithm
     ↓
Ranking
     ↓
Highlighting
     ↓
JSON Response
```
