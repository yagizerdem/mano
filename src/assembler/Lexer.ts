import {
  DIRECTIVE_KEYWORDS,
  IO_KEYWORDS,
  MRI_Keywords,
  REG_REF_KEYWORDS,
} from "../SD";
import { LexerException } from "./LexerException";

type TokenType =
  | "IDENTIFIER"
  | "KEYWORD"
  | "NUMBER_DEC"
  | "NUMBER_HEX"
  | "INDIRECTION";

class Token {
  public type!: TokenType;
  public lexeme!: string;
  public line!: number;
  public column!: number;
  public srcLine!: string;
  constructor(
    type: TokenType,
    lexeme: string,
    line: number,
    column: number,
    srcLine: string
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
    this.column = column;
    this.srcLine = srcLine;
  }

  public isDirective(): boolean {
    return DIRECTIVE_KEYWORDS.includes(this.lexeme);
  }

  public isMRI(): boolean {
    return MRI_Keywords.includes(this.lexeme);
  }
  public isRegisterRef(): boolean {
    return REG_REF_KEYWORDS.includes(this.lexeme);
  }
  public toString(): string {
    return `[${this.type}] ${this.lexeme} (line ${this.line}, col ${this.column})`;
  }
}

class Lexer {
  private program: string = "";

  constructor(program: string = "") {
    this.setProgram(program);
  }

  public getProgram(): string {
    return this.program;
  }

  public setProgram(program: string): void {
    this.program = program.toUpperCase();
  }

  public tokenize(): Token[] {
    const tokenStream: Token[] = [];
    // normalize line endings and split into lines
    const lines = this.program
      .split("\n")
      .map((line) => this.stripComment(line.trim()))
      .filter((line) => line.length > 0);

    for (let i = 0; i < lines.length; i++) {
      let line = lines.at(i);

      lines.forEach((line, i) => {
        const lexemes = line.trim().split(/\s+/);

        lexemes.forEach((lexeme) => {
          if (!lexeme) return;

          if (!/^[A-Z0-9,_-]+$/.test(lexeme)) {
            throw new LexerException(
              `Invalid token '${lexeme}' at line ${
                i + 1
              }. Allowed characters: A–Z, 0–9, and '_,'.`,
              i + 1,
              0
            );
          }
        });
      });

      const matches = line?.matchAll(/\w+/g);
      if (!matches) continue;
      for (const match of matches) {
        const newToken = new Token(
          this.classifyToken(
            match[0],
            tokenStream.length > 0 ? tokenStream[tokenStream.length - 1] : null
          ),
          match[0],
          i + 1,
          match.index! + 1,
          line!
        );
        tokenStream.push(newToken);
      }
    }

    return tokenStream;
  }

  private stripComment(line: string) {
    const indexOf = line.indexOf("//");
    return line.slice(0, indexOf === -1 ? line.length : indexOf);
  }

  private classifyToken(
    lexeme: string,
    prevToken: Token | null = null
  ): TokenType {
    if (
      MRI_Keywords.includes(lexeme) ||
      REG_REF_KEYWORDS.includes(lexeme) ||
      IO_KEYWORDS.includes(lexeme)
    )
      return "KEYWORD";

    if (DIRECTIVE_KEYWORDS.includes(lexeme)) return "KEYWORD";

    if (lexeme === "I") {
      if (
        prevToken &&
        (prevToken.type === "IDENTIFIER" ||
          prevToken.type === "NUMBER_HEX" ||
          prevToken.type === "NUMBER_DEC")
      ) {
        // I comes after an operand → treat as indirection
        return "INDIRECTION";
      } else {
        // could be a label named I
        return "IDENTIFIER";
      }
    }

    if (prevToken) {
      // check decimal
      if (
        prevToken.type === "KEYWORD" &&
        (prevToken.lexeme === "DEC" ||
          MRI_Keywords.includes(prevToken.lexeme)) &&
        /^\d+$/.test(lexeme)
      ) {
        return "NUMBER_DEC";
      }
      // check hex
      if (
        prevToken.type === "KEYWORD" &&
        (prevToken.lexeme === "HEX" || prevToken.lexeme === "ORG") &&
        /^[0-9A-F]+$/.test(lexeme)
      ) {
        return "NUMBER_HEX";
      }
    } else {
      // check decimal
      if (/^\d+$/.test(lexeme)) {
        return "NUMBER_DEC";
      }
      // check hex
      if (/^[0-9A-F]+$/.test(lexeme)) {
        return "NUMBER_HEX";
      }
    }

    // default case
    return "IDENTIFIER";
  }
}

export { Lexer, Token };
