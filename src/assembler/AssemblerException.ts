class AssemblerException extends Error {
  public line: number | null;
  public column: number | null;

  constructor(
    message: string,
    line: number | null = null,
    column: number | null = null
  ) {
    super(
      line !== null && column !== null
        ? `Assembler error at line ${line}, col ${column}: ${message}`
        : `Assembler error: ${message}`
    );

    this.name = "AssemblerException";
    this.line = line;
    this.column = column;

    Object.setPrototypeOf(this, AssemblerException.prototype);
  }
}

export { AssemblerException };
