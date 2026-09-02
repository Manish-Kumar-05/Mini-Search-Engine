export function intersection(
  first: Set<string>,
  second: Set<string>
): Set<string> {
  return new Set([...first].filter((documentId) => second.has(documentId)));
}

export function union(first: Set<string>, second: Set<string>): Set<string> {
  return new Set([...first, ...second]);
}

export function difference(
  first: Set<string>,
  second: Set<string>
): Set<string> {
  return new Set([...first].filter((documentId) => !second.has(documentId)));
}
