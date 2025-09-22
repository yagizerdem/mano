class ParseException extends Error {
  public line: number;
  public column: number;

  constructor(message: string, line: number, column: number) {
    super(`Parse error at line ${line}, col ${column}: ${message}`);

    this.name = "ParseException";
    this.line = line;
    this.column = column;

    Object.setPrototypeOf(this, ParseException.prototype);
  }
}

export { ParseException };
