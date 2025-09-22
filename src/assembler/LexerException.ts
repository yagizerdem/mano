class LexerException extends Error {
  public line: number;
  public column: number;

  constructor(message: string, line: number, column: number) {
    super(`Lexer error at line ${line}, col ${column}: ${message}`);

    this.name = "LexerException";
    this.line = line;
    this.column = column;

    Object.setPrototypeOf(this, LexerException.prototype);
  }
}

export { LexerException };
