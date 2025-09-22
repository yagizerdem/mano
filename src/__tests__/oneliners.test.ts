// import { render, screen, fireEvent } from "@testing-library/react";
// import { Lexer } from "../assembler/Lexer";
// import { Parser } from "../assembler/Parser";

// function runProgram(program: string) {
//   const lexer = new Lexer(program);
//   const tokens = lexer.tokenize();
//   const parser = new Parser(program, tokens);
//   parser.parse();
// }

// describe("Parser & Semantic Analysis", () => {
//   //
//   // -------- VALID PROGRAMS --------
//   //
//   it("accepts ORG with hex operand", () => {
//     expect(() => runProgram("ORG 100")).not.toThrow();
//   });

//   it("accepts ORG with decimal operand", () => {
//     expect(() => runProgram("ORG 25")).not.toThrow();
//   });

//   it("accepts END with no operands", () => {
//     expect(() => runProgram("END")).not.toThrow();
//   });

//   it("accepts HEX directive", () => {
//     expect(() => runProgram("VAL, HEX FF")).not.toThrow();
//   });

//   it("accepts DEC directive", () => {
//     expect(() => runProgram("NUM, DEC 10")).not.toThrow();
//   });

//   it("accepts MRI with address", () => {
//     expect(() => runProgram("LDA VAR1")).not.toThrow();
//   });

//   it("accepts MRI with indirection", () => {
//     expect(() => runProgram("ADD NUM, I")).not.toThrow();
//   });

//   it("accepts register reference instruction", () => {
//     expect(() => runProgram("CLA")).not.toThrow();
//   });

//   it("accepts IO instruction", () => {
//     expect(() => runProgram("INP")).not.toThrow();
//   });

//   it("accepts label + instruction", () => {
//     const program = `START, LDA NUM
// NUM, DEC 5`;
//     expect(() => runProgram(program)).not.toThrow();
//   });

//   it("accepts label + comment only", () => {
//     const program = `FOO, / just a comment`;
//     expect(() => runProgram(program)).toThrow();
//   });

//   //
//   // -------- INVALID PROGRAMS --------
//   //
//   it("rejects label without instruction", () => {
//     expect(() => runProgram("ONLYLABEL")).toThrow();
//   });

//   it("rejects MRI without address", () => {
//     expect(() => runProgram("LDA")).toThrow();
//   });

//   it("rejects MRI with too many operands", () => {
//     expect(() => runProgram("STA VAR1 VAR2")).toThrow();
//   });

//   it("rejects MRI with wrong operand type", () => {
//     expect(() => runProgram('ADD "HELLO"')).toThrow();
//   });

//   it("rejects NMRI with operand", () => {
//     expect(() => runProgram("CLA 100")).toThrow();
//   });

//   it("rejects END with operand", () => {
//     expect(() => runProgram("END 10")).toThrow();
//   });

//   it("rejects DEC without operand", () => {
//     expect(() => runProgram("DEC")).toThrow();
//   });

//   it("rejects HEX without operand", () => {
//     expect(() => runProgram("HEX")).toThrow();
//   });

//   it("rejects ORG without operand", () => {
//     expect(() => runProgram("ORG")).toThrow();
//   });

//   it("rejects unknown keyword", () => {
//     expect(() => runProgram("FOOBAR")).toThrow();
//   });
// });

// describe("Extra Single-line Programs", () => {
//   //
//   // -------- VALID SINGLE-LINE CASES --------
//   //
//   it("accepts simple label + MRI", () => {
//     expect(() => runProgram("LOOP, LDA COUNT")).not.toThrow();
//   });

//   it("accepts MRI with decimal address", () => {
//     expect(() => runProgram("STA 250")).not.toThrow();
//   });

//   it("accepts MRI with hex-style address treated as identifier", () => {
//     // If you don’t allow NUMBER_HEX as address directly, this should still parse as IDENTIFIER
//     expect(() => runProgram("BUN F0A")).not.toThrow();
//   });

//   it("accepts register ref with label", () => {
//     expect(() => runProgram("RESET, CLA")).not.toThrow();
//   });

//   it("accepts IO with label", () => {
//     expect(() => runProgram("READ, INP")).not.toThrow();
//   });

//   it("accepts HEX with label", () => {
//     expect(() => runProgram("DATA, HEX 1A")).not.toThrow();
//   });

//   it("accepts DEC with label", () => {
//     expect(() => runProgram("VALUE, DEC 1234")).not.toThrow();
//   });

//   it("accepts MRI with indirection but missing address", () => {
//     expect(() => runProgram("LDA I")).not.toThrow();
//   });

//   //
//   // -------- INVALID SINGLE-LINE CASES --------
//   //

//   it("rejects MRI with too many operands + indirection", () => {
//     expect(() => runProgram("ADD VAR1 VAR2 I")).toThrow();
//   });

//   it("rejects register ref with operand", () => {
//     expect(() => runProgram("CMA 200")).toThrow();
//   });

//   it("rejects IO instruction with operand", () => {
//     expect(() => runProgram("OUT VAR1")).toThrow();
//   });

//   it("rejects ORG with non-hex operand", () => {
//     expect(() => runProgram("ORG GHI")).toThrow();
//   });

//   it("rejects HEX with non-hex operand", () => {
//     expect(() => runProgram("HEX ZZZ")).toThrow();
//   });

//   it("rejects DEC with non-decimal operand", () => {
//     expect(() => runProgram("DEC 12AB")).toThrow();
//   });

//   it("rejects invalid character in identifier", () => {
//     expect(() => runProgram("NUM$, DEC 5")).toThrow();
//   });
// });
