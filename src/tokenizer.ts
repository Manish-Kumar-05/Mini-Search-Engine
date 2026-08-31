export function tokenizer(text: string): string[] {
  return text
    .replace(/[^\w\s]/g, "") //remove punctuation
    .split(/\s+/) // splits the text
    .filter(Boolean); //remove empty strings
}

// \s white spaces
// \w words
