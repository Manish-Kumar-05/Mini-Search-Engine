// Abstract Syntax Tree (AST)
// AND has higher precedence than OR
export type QueryNode =
  | {
      type: "TERM";
      value: string;
    }
  | {
      type: "AND" | "OR";
      left: QueryNode;
      right: QueryNode;
    }
  | {
      type: "NOT";
      child: QueryNode;
    };

export class QueryParser {
  private tokens: string[] = [];
  private position = 0;

  parse(query: string): QueryNode {
    this.tokens = this.tokenize(query);
    this.position = 0;

    if (this.tokens.length === 0) {
      throw new Error("Query cannot be empty");
    }

    const result = this.parseOr();

    if (this.position < this.tokens.length) {
      throw new Error(`Unexpected token: ${this.tokens[this.position]}`);
    }

    return result;
  }

  private tokenize(query: string): string[] {
    return query
      .replace(/\(/g, " ( ")
      .replace(/\)/g, " ) ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  private parseOr(): QueryNode {
    let left = this.parseAnd();

    while (this.peek()?.toUpperCase() === "OR") {
      this.consume();

      const right = this.parseAnd();

      left = {
        type: "OR",
        left,
        right,
      };
    }

    return left;
  }

  private parseAnd(): QueryNode {
    let left = this.parseNot();

    while (this.peek()?.toUpperCase() === "AND") {
      this.consume();

      const right = this.parseNot();

      left = {
        type: "AND",
        left,
        right,
      };
    }

    return left;
  }

  private parseNot(): QueryNode {
    if (this.peek()?.toUpperCase() === "NOT") {
      this.consume();

      const child = this.parseNot();

      return {
        type: "NOT",
        child,
      };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): QueryNode {
    const token = this.peek();

    if (!token) {
      throw new Error("Unexpected end of query");
    }

    if (token === "(") {
      this.consume();

      const expression = this.parseOr();

      if (this.peek() !== ")") {
        throw new Error("Missing closing parenthesis");
      }

      this.consume();

      return expression;
    }

    if (token === ")") {
      throw new Error("Unexpected closing parenthesis");
    }

    this.consume();

    return {
      type: "TERM",
      value: token,
    };
  }

  private peek(): string | undefined {
    return this.tokens[this.position];
  }

  private consume(): string {
    const token = this.tokens[this.position];

    this.position++;

    return token;
  }
}

//     {
//     type: "AND",

//     left: {
//         type: "TERM",
//         value: "python"
//     },

//     right: {
//         type: "TERM",
//         value: "machine"
//     }
// }
