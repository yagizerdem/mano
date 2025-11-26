import { IO_KEYWORDS, MRI_Keywords, opCodes, REG_REF_KEYWORDS } from "../SD";
import { AssemblerException } from "./AssemblerException";
import { Lexer, Token } from "./Lexer";
import { Parser } from "./Parser";

const MAX_WORD_SIZE = 0xffff; // 16 bit

class Instruction {
  public origin: number;
  public binary: number;
  public srcLine: string;
  public srcLineNum: number;

  constructor(
    origin: number,
    binary: number,
    srcLine: string,
    srcLineNum: number
  ) {
    this.origin = origin;
    this.binary = binary;
    this.srcLine = srcLine;
    this.srcLineNum = srcLineNum;
  }
  public toString(): string {
    return `Origin: ${this.origin}, Binary: ${this.binary
      .toString(2)
      .padStart(16, "0")}, SrcLine: ${this.srcLine}, SrcLineNum: ${
      this.srcLineNum
    }`;
  }
}

class Data {
  public origin: number;
  public binary: number;

  public constructor(origin: number, binary: number) {
    this.origin = origin;
    this.binary = binary;
  }

  public toString(): string {
    return `Origin: ${this.origin}, Binary: ${this.binary
      .toString(2)
      .padStart(16, "0")}`;
  }
}

class Program {
  public instructions: Instruction[] = [];
  public data: Data[] = [];
}

class Assembler {
  private lexer!: Lexer;
  private parser!: Parser;
  private program: string = "";
  private tokenStream!: Token[];
  private lines: { [line: number]: Token[] } = {};
  private symbolTable: { [name: string]: number } = {};

  constructor(program: string) {
    this.setProgram(program);
  }

  public getProgram(): string {
    return this.program;
  }

  public setProgram(program: string): void {
    this.program = program.toUpperCase();
  }

  public getTokenStream(): Token[] {
    return this.tokenStream;
  }

  public setTokenStream(tokenStream: Token[]): void {
    this.tokenStream = tokenStream;
  }

  public getLines(): { [line: number]: Token[] } {
    return this.lines;
  }

  public setLines(lines: { [line: number]: Token[] }): void {
    this.lines = lines;
  }

  public assemble(): Program {
    this.symbolTable = {}; // reset symbol table
    this.lexer = new Lexer();
    this.lexer.setProgram(this.getProgram());
    this.setTokenStream(this.lexer.tokenize());
    this.parser = new Parser(this.getProgram(), this.getTokenStream());
    this.setLines(this.parser.parse());

    this.semanticAnalysis();

    // 2 pass assembler
    this.firstPass();
    const program = this.secondPass();

    return program;
  }

  private semanticAnalysis(): void {
    this.checkEndDirectiveViolation();
  }

  private checkEndDirectiveViolation(): void {
    // check end existence
    if (
      !this.tokenStream.find((t) => t.type === "KEYWORD" && t.lexeme === "END")
    ) {
      throw new AssemblerException(
        "Missing END directive",
        this.tokenStream.at(-1)?.line || 0,
        this.tokenStream.at(-1)?.column || 0
      );
    }

    // multiple end check
    if (
      this.tokenStream.filter((t) => t.type === "KEYWORD" && t.lexeme === "END")
        .length > 1
    ) {
      throw new AssemblerException(
        "Multiple END directives",
        this.tokenStream.at(-1)?.line || 0,
        this.tokenStream.at(-1)?.column || 0
      );
    }

    // END must be the last statement
    const lastToken = this.tokenStream.at(-1);
    if (!(lastToken?.type === "KEYWORD" && lastToken?.lexeme === "END")) {
      throw new AssemblerException(
        "END directive must be the last statement",
        lastToken?.line || 0,
        lastToken?.column || 0
      );
    }
  }

  private firstPass(): void {
    let lc = 0;
    // build symbol table
    for (const line of Object.values(this.lines)) {
      const firstToken = line[0];

      // ORG directive changes LC
      if (firstToken.lexeme === "ORG") {
        lc = parseInt(line[1].lexeme, 16); // HEX only for ORG
        continue;
      }

      if (firstToken.type === "IDENTIFIER") {
        if (this.symbolTable[firstToken.lexeme] !== undefined) {
          throw new AssemblerException(
            `Duplicate label '${firstToken.lexeme}'`,
            firstToken.line,
            firstToken.column
          );
        }
        this.symbolTable[firstToken.lexeme] = lc;
      }

      lc++; // increment LC for each line (instruction or data)
    }

    // check undefined labels
    for (const token of this.tokenStream) {
      if (token.type === "IDENTIFIER") {
        if (this.symbolTable[token.lexeme] === undefined) {
          throw new AssemblerException(
            `Undefined label '${token.lexeme}'`,
            token.line,
            token.column
          );
        }
      }
    }
  }

  private secondPass(): Program {
    const dataBuffer: Data[] = [];
    const instructionBuffer: Instruction[] = [];

    let lc = 0; // default origin

    for (const line of Object.values(this.lines)) {
      const deepCopy: Token[] = JSON.parse(JSON.stringify(line));

      {
        const [firstToken, ...rest] = deepCopy;
        if (firstToken.type === "IDENTIFIER") {
          deepCopy.shift();
        }
      }

      const [firstToken, ...rest] = deepCopy;

      // Directives
      if (firstToken.lexeme === "ORG") {
        lc = parseInt(rest[0].lexeme, 16);
        continue;
      } else if (firstToken.lexeme === "END") {
        break;
      } else if (firstToken.lexeme === "DEC") {
        let value = parseInt(rest[0].lexeme, 10);
        if (value < -32768 || value > 32767) {
          throw new AssemblerException(
            "DEC value out of range (-32768 to 32767)",
            rest[0].line,
            rest[0].column
          );
        }
        // 2's complement mask
        value = value & 0xffff;
        const data = new Data(lc, value);
        dataBuffer.push(data);
      } else if (firstToken.lexeme === "HEX") {
        const value = parseInt(rest[0].lexeme, 16);
        if (value < 0 || value > MAX_WORD_SIZE) {
          throw new AssemblerException(
            `HEX value out of range (0-${MAX_WORD_SIZE})`,
            rest[0].line,
            rest[0].column
          );
        }
        const data = new Data(lc, value);
        dataBuffer.push(data);
      }

      // MRI
      if (MRI_Keywords.includes(firstToken.lexeme)) {
        const opCode = opCodes[firstToken.lexeme as keyof typeof opCodes];
        const [addressToken, ...restTokens] = rest;
        let address: number;
        if (addressToken.type === "NUMBER_DEC") {
          address = parseInt(addressToken.lexeme, 10) & 0x0fff;
        } else {
          address = this.symbolTable[addressToken.lexeme] & 0x0fff;
        }
        const indirectFlag =
          restTokens[0] &&
          (restTokens[0].lexeme === "I" || restTokens[0].type === "INDIRECTION")
            ? 0x8000
            : 0x0000;

        const machineCode = (opCode << 12) | (address & 0x0fff) | indirectFlag;
        const instruction = new Instruction(
          lc,
          machineCode,
          line.map((t) => t.lexeme).join(" "),
          firstToken.line
        );
        instructionBuffer.push(instruction);
      }

      // Register-Reference and I/O
      if (
        REG_REF_KEYWORDS.includes(firstToken.lexeme) ||
        IO_KEYWORDS.includes(firstToken.lexeme)
      ) {
        const opCode = opCodes[firstToken.lexeme as keyof typeof opCodes];
        const machineCode = opCode;
        const instruction = new Instruction(
          lc,
          machineCode,
          line.map((t) => t.lexeme).join(" "),
          firstToken.line
        );
        instructionBuffer.push(instruction);
      }

      lc++;
    }

    const program = new Program();
    program.data = dataBuffer;
    program.instructions = instructionBuffer;
    return program;
  }
}

export { Assembler, Program, Instruction, Data };
