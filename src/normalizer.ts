export function normalizeToken(token: string): string {
  return token.toLowerCase().trim();
}

export function normalizeTokens(tokens: string[]): string[] {
  return tokens.map(normalizeToken).filter(Boolean);
}
