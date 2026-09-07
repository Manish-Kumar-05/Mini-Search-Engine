const SYNONYMS: Record<string, string[]> = {
  car: ["automobile", "vehicle"],
  computer: ["pc", "machine"],
  programming: ["coding", "development"],
  database: ["db"],
  javascript: ["js"],
  typescript: ["ts"],
};

export class QueryExpander {
  expand(terms: string[]): string[] {
    const expandedTerms = new Set<string>();

    for (const term of terms) {
      expandedTerms.add(term);

      const synonyms = SYNONYMS[term] ?? [];

      for (const synonym of synonyms) {
        expandedTerms.add(synonym);
      }
    }

    return [...expandedTerms];
  }
}
