import { createApp } from "./api/server.js";
import { buildSearchEngine } from "./search-engine-builder.js";

const searchEngine = await buildSearchEngine();

const app = createApp(searchEngine);

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Search API running on http://localhost:${PORT}`);
});
