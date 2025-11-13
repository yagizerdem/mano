/**
 * Production rules 
 * ------------------------------------------------
 * 
 * <program>       ::= { <line> }

<line>          ::= [ <label> ] [ <instruction> ] [ <comment> ]

<label>         ::= <identifier> [ "," ]

<instruction>   ::= <MRI> <address> [ ,<I> ]
                  | <register-ref>
                  | <io-instr>
                  | ORG <hexnumber>
                  | END
                  | HEX <hexnumber>
                  | DEC <decimalnumber>

<MRI>           ::= "AND" | "ADD" | "LDA" | "STA" 
                  | "BUN" | "BSA" | "ISZ"

<register-ref>  ::= "CLA" | "CLE" | "CMA" | "CME" 
                  | "CIR" | "CIL" | "INC" 
                  | "SPA" | "SNA" | "SZA" | "SZE" 
                  | "HLT"

<io-instr>      ::= "INP" | "OUT" | "SKI" | "SKO" | "ION" | "IOF"

<address>       ::= <identifier> | <decimalnumber> 

<identifier>    ::= <letter> { <letter> | <digit> }

<hexnumber>     ::= [0-9A-F]+
<decimalnumber> ::= -?[0-9]+

<comment>       ::= "/" { any-character }
 * 
 * 
 */

import {
  DIRECTIVE_KEYWORDS,
  IO_KEYWORDS,
  MRI_Keywords,
  REG_REF_KEYWORDS,
} from "../SD";
import type { Token } from "./Lexer";
import { ParseException } from "./ParseException";

class Parser {
  private program!: string;

  private tokenStream!: Token[];

  private lookAhead!: number;

  constructor(program: string, tokenStream: Token[]) {
    this.setProgram(program);
    this.setTokenStream(tokenStream);
  }

  public setProgram(program: string) {
    this.program = program.toUpperCase();
  }

  public getProgram() {
    return this.program;
  }

  public getTokenStream() {
    return this.tokenStream;
  }

  public setTokenStream(tokenStream: Token[]) {
    this.tokenStream = tokenStream;
  }

  private peek() {
    return this.tokenStream[this.lookAhead];
  }

  private move() {
    if (this.lookAhead >= this.tokenStream.length) {
      return null;
    }

    const token = this.tokenStream[this.lookAhead];
    this.lookAhead++;
    return token;
  }

  // recursive decent parser methods
  public parse(): { [line: number]: Token[] } {
    this.lookAhead = 0;
    // elemninate tail recursion
    while (this.lookAhead < this.tokenStream.length) {
      const token = this.peek();

      if (token.type === "IDENTIFIER") {
        this.parseLabel();
      }
      this.parseInstruction();
    }

    const lines = this.parseLine();

    return lines;
  }

  private parseLabel() {
    const firstLook = this.peek();

    if (firstLook.type === "IDENTIFIER") {
      this.parseIdentifier();

      const next = this.peek();
      if (next.lexeme === ",") {
        this.move(); // consume comma
      }
    }
  }

  private parseInstruction() {
    const firstLook = this.peek();
    if (firstLook.type !== "KEYWORD") {
      throw new ParseException(
        `Expected KEYWORD, found ${firstLook.type}`,
        firstLook.line,
        firstLook.column
      );
    }

    if (MRI_Keywords.includes(firstLook.lexeme)) {
      this.parseMRI();
    } else if (REG_REF_KEYWORDS.includes(firstLook.lexeme)) {
      this.move(); // consume register ref
    } else if (IO_KEYWORDS.includes(firstLook.lexeme)) {
      this.move(); // consume io instruction
    } else if (DIRECTIVE_KEYWORDS.includes(firstLook.lexeme)) {
      this.parseDirective();
    }
  }

  private parseIdentifier() {
    const firstLook = this.peek();
    // strict match
    if (firstLook.type !== "IDENTIFIER") {
      throw new ParseException(
        `Expected IDENTIFIER, found ${firstLook.type}`,
        firstLook.line,
        firstLook.column
      );
    }
    if (/^[A-Z0-9_]+$/.test(firstLook.lexeme) === false) {
      throw new ParseException(
        `Invalid IDENTIFIER, found ${firstLook.lexeme}`,
        firstLook.line,
        firstLook.column
      );
    }

    // cannot start with digit
    if (/^[0-9]/.test(firstLook.lexeme.charAt(0))) {
      throw new ParseException(
        `Invalid IDENTIFIER, found ${firstLook.lexeme}`,
        firstLook.line,
        firstLook.column
      );
    }

    this.move(); // consume identifier
  }

  private parseMRI() {
    const firstLook = this.peek();
    if (!firstLook || firstLook.type !== "KEYWORD") {
      throw new ParseException(
        `Expected KEYWORD, found ${firstLook?.type}`,
        firstLook?.line,
        firstLook?.column
      );
    }

    if (!MRI_Keywords.includes(firstLook.lexeme)) {
      throw new ParseException(
        `Invalid MRI, found ${firstLook.lexeme}`,
        firstLook.line,
        firstLook.column
      );
    }

    this.move(); // consume MRI
    this.parseAddress();
    this.parseI(); // optional I consume if exists
  }

  private parseAddress() {
    const firstLook = this.peek();
    if (!firstLook) {
      throw new ParseException(`Expected IDENTIFIER`, null!, null!);
    }

    if (firstLook.type !== "NUMBER_DEC" && firstLook.type !== "IDENTIFIER") {
      throw new ParseException(
        `Expected IDENTIFIER or NUMBER_DEC, found ${firstLook.type}`,
        firstLook.line,
        firstLook.column
      );
    }

    this.move(); // consume address
  }

  private parseI() {
    const firstLook = this.peek();
    if (
      firstLook &&
      firstLook.lexeme === "I" &&
      firstLook.type === "INDIRECTION"
    ) {
      this.move(); // consume I
    }
  }

  private parseDirective() {
    const firstLook = this.peek();
    if (!firstLook || firstLook.type !== "KEYWORD") {
      throw new ParseException(
        `Expected Directive , found ${firstLook?.type}`,
        firstLook?.line,
        firstLook?.column
      );
    }

    if (firstLook.lexeme === "ORG") {
      this.move(); // consume ORG
      this.parseHexNumber();
    } else if (firstLook.lexeme === "END") {
      this.move(); // consume END
    } else if (firstLook.lexeme === "HEX") {
      this.move(); // consume HEX
      this.parseHexNumber();
    } else if (firstLook.lexeme === "DEC") {
      this.move(); // consume DEC
      this.parseDecNumber();
    }
  }

  private parseHexNumber() {
    const firstLook = this.peek();
    if (!firstLook || firstLook.type !== "NUMBER_HEX") {
      throw new ParseException(
        `Expected HEX NUMBER, found ${firstLook?.type}`,
        firstLook?.line,
        firstLook?.column
      );
    }

    // strictly match hex number
    if (!/^[0-9A-F]+$/.test(firstLook.lexeme)) {
      throw new ParseException(
        `Invalid HEX NUMBER, found ${firstLook.lexeme}`,
        firstLook.line,
        firstLook.column
      );
    }

    this.move(); // consume HEX NUMBER
  }

  private parseDecNumber() {
    const firstLook = this.peek();
    if (!firstLook || firstLook.type !== "NUMBER_DEC") {
      throw new ParseException(
        `Expected DEC NUMBER, found ${firstLook?.type}`,
        firstLook?.line,
        firstLook?.column
      );
    }

    // strictly match dec number
    if (!/^-?[0-9]+$/.test(firstLook.lexeme)) {
      throw new ParseException(
        `Invalid DEC NUMBER, found ${firstLook.lexeme}`,
        firstLook.line,
        firstLook.column
      );
    }
    this.move(); // consume DEC NUMBER
  }

  // line based parsing strictly check grammer rules
  private parseLine(): { [line: number]: Token[] } {
    const lines: { [line: number]: Token[] } = {};

    for (let token of this.tokenStream) {
      if (!lines[token.line]) {
        lines[token.line] = [];
      }
      lines[token.line].push(token);
    }

    for (let i = 0; i < Object.keys(lines).length; i++) {
      const lineTokens = Object.values(lines)[i];

      if (lineTokens.length === 0) {
        continue; // empty line
      }

      const firstToken = lineTokens[0];

      const deepCopy = JSON.parse(JSON.stringify(lineTokens));

      if (firstToken.type === "IDENTIFIER") {
        deepCopy.shift(); // consume label
      }

      this.parseInstructionLine(deepCopy, firstToken);
    }

    return lines;
  }

  private parseInstructionLine(line: Token[], prevToken: Token) {
    if (line.length === 0) {
      throw new ParseException(
        `Line ${prevToken.line} has a label '${prevToken.lexeme}' but no instruction. Each label must be followed by an instruction or directive.`,
        prevToken.line,
        prevToken.column
      );
    }

    const [firstToken, ...rest] = line;

    if (firstToken.type !== "KEYWORD") {
      throw new ParseException(
        `Line ${firstToken.line} expected KEYWORD, found ${firstToken.type}`,
        firstToken.line,
        firstToken.column
      );
    }

    if (MRI_Keywords.includes(firstToken.lexeme)) {
      const [secondToken, ...remaining] = rest;
      if (!secondToken) {
        throw new ParseException(
          `Line ${firstToken.line}: MRI instruction '${firstToken.lexeme}' requires an address operand, but none was provided.`,
          firstToken.line,
          firstToken.column
        );
      }

      if (
        secondToken.type !== "IDENTIFIER" &&
        secondToken.type !== "NUMBER_DEC"
      ) {
        throw new ParseException(
          `Line ${secondToken.line}: MRI instruction '${firstToken.lexeme}' requires an address operand, found ${secondToken.type}.`,
          secondToken.line,
          secondToken.column
        );
      }

      if (remaining.length > 1) {
        throw new ParseException(
          "Too much operands in line",
          firstToken.line,
          firstToken.column
        );
      }

      if (remaining.length === 1) {
        const indirection = remaining.at(0)!;
        if (indirection.lexeme !== "I" || indirection.type !== "INDIRECTION") {
          throw new ParseException(
            `Line ${indirection.line}: Unexpected token '${indirection.lexeme}' after address operand. Only 'I' is allowed for indirect addressing.`,
            indirection.line,
            indirection.column
          );
        }
      }
    }

    if (
      REG_REF_KEYWORDS.includes(firstToken.lexeme) ||
      IO_KEYWORDS.includes(firstToken.lexeme)
    ) {
      // Handle register and I/O instructions
      if (rest.length > 0) {
        throw new ParseException(
          `Line ${firstToken.line}: Instruction '${firstToken.lexeme}' does not take any operands, but found extra tokens.`,
          firstToken.line,
          firstToken.column
        );
      }

      return;
    }

    if (firstToken.type === "KEYWORD" && firstToken.lexeme === "ORG") {
      if (rest.length !== 1) {
        throw new ParseException(
          `Line ${firstToken.line}: ORG directive requires exactly one operand, found ${rest.length}.`,
          firstToken.line,
          firstToken.column
        );
      }
      const operand = rest[0];
      if (operand.type !== "NUMBER_HEX") {
        throw new ParseException(
          `Line ${operand.line}: ORG directive requires a hexadecimal operand, found ${operand.type}.`,
          operand.line,
          operand.column
        );
      }
    }

    if (firstToken.type === "KEYWORD" && firstToken.lexeme === "END") {
      if (rest.length !== 0) {
        throw new ParseException(
          `Line ${firstToken.line}: END directive does not take any operands, but found extra tokens.`,
          firstToken.line,
          firstToken.column
        );
      }
    }

    if (firstToken.type === "KEYWORD" && firstToken.lexeme === "HEX") {
      if (rest.length !== 1) {
        throw new ParseException(
          `Line ${firstToken.line}: HEX directive requires exactly one operand, found ${rest.length}.`,
          firstToken.line,
          firstToken.column
        );
      }
      const operand = rest[0];
      if (operand.type !== "NUMBER_HEX") {
        throw new ParseException(
          `Line ${operand.line}: HEX directive requires a hexadecimal operand, found ${operand.type}.`,
          operand.line,
          operand.column
        );
      }
    }

    if (firstToken.type === "KEYWORD" && firstToken.lexeme === "DEC") {
      if (rest.length !== 1) {
        throw new ParseException(
          `Line ${firstToken.line}: DEC directive requires exactly one operand, found ${rest.length}.`,
          firstToken.line,
          firstToken.column
        );
      }
      const operand = rest[0];
      if (operand.type !== "NUMBER_DEC") {
        throw new ParseException(
          `Line ${operand.line}: DEC directive requires a decimal operand, found ${operand.type}.`,
          operand.line,
          operand.column
        );
      }
    }
  }
}

export { Parser };
