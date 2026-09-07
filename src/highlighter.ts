export function highlightTerms(text: string, terms: string[]): string {
  if (terms.length === 0) {
    return text;
  }

  const escapedTerms = terms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  const pattern = new RegExp(`(${escapedTerms.join("|")})`, "gi");

  return text.replace(pattern, "<mark>$1</mark>");
}
