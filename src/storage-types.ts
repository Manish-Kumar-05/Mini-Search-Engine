import { Document } from "./types.js";

export interface SearchEngineState {
  invertedIndex: ReturnType<
    import("./inverted-index.js").InvertedIndex["exportState"]
  >;

  positionalIndex: ReturnType<
    import("./positional-index.js").PositionalIndex["exportState"]
  >;

  documents: Document[];
}
