import { render, screen, fireEvent } from "@testing-library/react";
import { Lexer } from "../assembler/Lexer";
import { Parser } from "../assembler/Parser";
import { Assembler } from "../assembler/Assembler";

function runProgram(program: string) {
  const assembler: Assembler = new Assembler(program);
  assembler.assemble();
}

it("accepts a full program with labels, MRI, NMRI, IO, directives", () => {
  const program = `
    ORG 100
START, LDA NUM
       ADD ONE
       STA RESULT
       CLA
       INP
       OUT
       HLT
NUM,   DEC 5
ONE,   DEC 1
RESULT, HEX 0F
END
  `;
  expect(() => runProgram(program)).not.toThrow();
});

it("accepts program with indirection and multiple directives", () => {
  const program = `
    ORG 200
MAIN,  LDA VALUE, I
       ISZ VALUE
       BUN MAIN
VALUE, DEC 3
BUF,   HEX FF
END
  `;
  expect(() => runProgram(program)).not.toThrow();
});

it("rejects program with two END directives", () => {
  const program = `
    ORG 100
START, LDA NUM
END
END
  `;
  expect(() => runProgram(program)).toThrow();
});

it("rejects program with MRI missing operands in multiple places", () => {
  const program = `
    ORG 100
A,     LDA
B,     ADD
C,     STA
END
  `;
  expect(() => runProgram(program)).toThrow();
});

it("rejects program with illegal directive usage", () => {
  const program = `
    ORG 100
DATA, DEC
MORE, HEX
END
  `;
  expect(() => runProgram(program)).toThrow();
});

it("rejects program with instruction after END", () => {
  const program = `
    ORG 100
NUM, DEC 10
END
ADD NUM
  `;
  expect(() => runProgram(program)).toThrow();
});

it("accepts program with defined labels", () => {
  const program = `
    ORG 100
START, LDA N
       ADD FACT
       STA RESULT
       HLT
N,     DEC 5
FACT,  DEC 10
RESULT, DEC 0
END
  `;
  expect(() => runProgram(program)).not.toThrow();
});

it("rejects program with multiple undefined labels", () => {
  const program = `
    ORG 200
MAIN,  LDA A
       ADD B
       STA C
       BUN LOOP
LOOP,  ISZ COUNT
       BUN MAIN
       HLT
COUNT, DEC 10
END
  `;
  // A, B, C tanımlı değil
  expect(() => runProgram(program)).toThrow(/undefined label/i);
});

it("accepts program with IO and register reference instructions", () => {
  const program = `
    ORG 200
START, INP
       STA NUM
       CLE
       CLA
       ADD NUM
       OUT
       HLT
NUM,   DEC 15
END
  `;
  expect(() => runProgram(program)).not.toThrow();
});

it("accepts program with multiple data locations and indirection", () => {
  const program = `
    ORG 300
       LDA PTR, I
       ADD VAL
       STA RES
       HLT
PTR,   HEX 305
VAL,   DEC 7
RES,   DEC 0
END
  `;
  expect(() => runProgram(program)).not.toThrow();
});

it("rejects MRI with too many operands in a big program", () => {
  const program = `
    ORG 500
START, LDA NUM1 NUM2
       ADD NUM3
       HLT
NUM1,  DEC 1
NUM2,  DEC 2
NUM3,  DEC 3
END
  `;
  expect(() => runProgram(program)).toThrow();
});

it("rejects program with invalid label starting with digit", () => {
  const program = `
    ORG 600
1START, LDA VAL
       HLT
VAL,   DEC 5
END
  `;
  expect(() => runProgram(program)).toThrow();
});

describe("Complex Mano Assembly Parser Tests", () => {
  it("accepts complex sorting algorithm with multiple loops and indirection", () => {
    const program = `
      ORG 100
      SORT,   LDA SIZE
              STA OUTER
              CLA
      OLOOP,  LDA OUTER
              SZA
              BUN DONE
              LDA OUTER
              STA INNER
              LDA ARRAY
              STA PTR1
      ILOOP,  LDA INNER
              SZA
              BUN NEXTOUT
              LDA PTR1, I
              STA TEMP1
              ISZ PTR1
              LDA PTR1, I
              STA TEMP2
              CMA
              INC
              ADD TEMP1
              SPA
              BUN NOSWAP
              LDA TEMP2
              STA PTR1, I
              ISZ PTR1
              LDA TEMP1
              CMA
              STA PTR1, I
              LDA PTR1
              CMA
              INC
              STA PTR1
      NOSWAP, ISZ INNER
              ISZ INNER
              BUN ILOOP
      NEXTOUT,ISZ OUTER
              BUN OLOOP
      DONE,   HLT
      SIZE,   DEC 10
      OUTER,  DEC 0
      INNER,  DEC 0
      PTR1,   HEX 200
      TEMP1,  DEC 0
      TEMP2,  DEC 0
      ARRAY,  HEX 200
              ORG 200
              DEC 45
              DEC 23
              DEC 78
              DEC 12
              DEC 67
              DEC 34
              DEC 89
              DEC 56
              DEC 90
              DEC 11
      END
    `;
    expect(() => runProgram(program)).not.toThrow();
  });

  it("accepts complex calculator with I/O operations and multiple subroutines", () => {
    const program = `
      ORG 100
      CALC,   CLA
              INP
              STA NUM1
              INP
              STA NUM2
              INP
              STA OPER
              LDA OPER
              CMA
              INC
              ADD ADDOP
              SZA
              BUN CHKSUB
              BSA ADDSUB
              BUN OUTPUT
      CHKSUB, LDA OPER
              CMA
              INC
              ADD SUBOP
              SZA
              BUN CHKMUL
              BSA SUBSUB
              BUN OUTPUT
      CHKMUL, LDA OPER
              CMA
              INC
              ADD MULOP
              SZA
              BUN CHKDIV
              BSA MULSUB
              BUN OUTPUT
      CHKDIV, LDA OPER
              CMA
              INC
              ADD DIVOP
              SZA
              BUN ERROR
              BSA DIVSUB
              BUN OUTPUT
      ADDSUB, HEX 0
              LDA NUM1
              ADD NUM2
              STA RESULT
              BUN ADDSUB, I
      SUBSUB, HEX 0
              LDA NUM1
              CMA
              INC
              ADD NUM2
              STA RESULT
              BUN SUBSUB, I
      MULSUB, HEX 0
              CLA
              STA RESULT
              LDA NUM2
              STA COUNT
      MULLOOP,LDA COUNT
              SZA
              BUN MULDONE
              LDA RESULT
              ADD NUM1
              STA RESULT
              ISZ COUNT
              BUN MULLOOP
      MULDONE,BUN MULSUB, I
      DIVSUB, HEX 0
              CLA
              STA RESULT
              LDA NUM1
              STA TEMP
      DIVLOOP,LDA TEMP
              CMA
              INC
              ADD NUM2
              SNA
              BUN DIVDONE
              STA TEMP
              ISZ RESULT
              BUN DIVLOOP
      DIVDONE,BUN DIVSUB, I
      OUTPUT, LDA RESULT
              OUT
              BUN CALC
      ERROR,  LDA ERRCODE
              OUT
              HLT
      NUM1,   DEC 0
      NUM2,   DEC 0
      OPER,   DEC 0
      RESULT, DEC 0
      COUNT,  DEC 0
      TEMP,   DEC 0
      ADDOP,  DEC 43
      SUBOP,  DEC 45
      MULOP,  DEC 42
      DIVOP,  DEC 47
      ERRCODE,DEC 999
      END
    `;
    expect(() => runProgram(program)).not.toThrow();
  });

  it("accepts matrix multiplication program with nested loops", () => {
    const program = `
      ORG 100
      MATRIX, CLA
              STA I
              STA J
              STA K
      ILOOP,  LDA I
              CMA
              INC
              ADD MSIZE
              SZA
              BUN DONE
              CLA
              STA J
      JLOOP,  LDA J
              CMA
              INC
              ADD MSIZE
              SZA
              BUN NEXTI
              CLA
              STA SUM
              STA K
      KLOOP,  LDA K
              CMA
              INC
              ADD MSIZE
              SZA
              BUN NEXTJ
              LDA I
              CIL
              CIL
              ADD J
              ADD MATA
              STA PTR
              LDA PTR, I
              STA TEMP1
              LDA K
              CIL
              CIL
              ADD J
              ADD MATB
              STA PTR
              LDA PTR, I
              STA TEMP2
              BSA MULTIPLY
              LDA SUM
              ADD PRODUCT
              STA SUM
              ISZ K
              BUN KLOOP
      NEXTJ,  LDA I
              CIL
              CIL
              ADD J
              ADD MATC
              STA PTR
              LDA SUM
              STA PTR, I
              ISZ J
              BUN JLOOP
      NEXTI,  ISZ I
              BUN ILOOP
      DONE,   HLT
      MULTIPLY,HEX 0
              CLA
              STA PRODUCT
              LDA TEMP2
              STA COUNT
      MULLOOP,LDA COUNT
              SZA
              BUN MULDONE
              LDA PRODUCT
              ADD TEMP1
              STA PRODUCT
              ISZ COUNT
              BUN MULLOOP
      MULDONE,BUN MULTIPLY, I
      I,      DEC 0
      J,      DEC 0
      K,      DEC 0
      SUM,    DEC 0
      PTR,    DEC 0
      TEMP1,  DEC 0
      TEMP2,  DEC 0
      PRODUCT,DEC 0
      COUNT,  DEC 0
      MSIZE,  DEC 4
      MATA,   HEX 300
      MATB,   HEX 400
      MATC,   HEX 500
              ORG 300
              DEC 1
              DEC 2
              DEC 3
              DEC 4
              DEC 5
              DEC 6
              DEC 7
              DEC 8
              DEC 9
              DEC 10
              DEC 11
              DEC 12
              DEC 13
              DEC 14
              DEC 15
              DEC 16
              ORG 400
              DEC 16
              DEC 15
              DEC 14
              DEC 13
              DEC 12
              DEC 11
              DEC 10
              DEC 9
              DEC 8
              DEC 7
              DEC 6
              DEC 5
              DEC 4
              DEC 3
              DEC 2
              DEC 1
              ORG 500
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
      END
    `;
    expect(() => runProgram(program)).not.toThrow();
  });

  it("accepts complex string processing program with multiple I/O operations", () => {
    const program = `
      ORG 100
      STRING, CLA
              STA COUNT
              STA INDEX
              LDA BUFFER
              STA PTR
      INPUT,  INP
              STA CHAR
              LDA CHAR
              CMA
              INC
              ADD NEWLINE
              SZA
              BUN STORE
              BUN PROCESS
      STORE,  LDA CHAR
              STA PTR, I
              ISZ PTR
              ISZ COUNT
              LDA COUNT
              CMA
              INC
              ADD MAXLEN
              SZA
              BUN INPUT
              BUN PROCESS
      PROCESS,CLA
              STA INDEX
              LDA BUFFER
              STA PTR
      UPPER,  LDA INDEX
              CMA
              INC
              ADD COUNT
              SZA
              BUN REVERSE
              LDA PTR, I
              STA CHAR
              LDA CHAR
              CMA
              INC
              ADD LOWERA
              SNA
              BUN CONVERT
              LDA CHAR
              CMA
              INC
              ADD LOWERZ
              SPA
              BUN NEXT
      CONVERT,LDA CHAR
              CMA
              INC
              ADD DIFF
              STA PTR, I
      NEXT,   ISZ PTR
              ISZ INDEX
              BUN UPPER
      REVERSE,LDA COUNT
              CIR
              STA HALF
              CLA
              STA INDEX
              LDA BUFFER
              STA PTR1
              LDA COUNT
              CMA
              INC
              ADD PTR1
              STA PTR2
      REVLOOP,LDA INDEX
              CMA
              INC
              ADD HALF
              SZA
              BUN OUTPUT
              LDA PTR1, I
              STA TEMP1
              LDA PTR2, I
              STA TEMP2
              LDA TEMP1
              STA PTR2, I
              LDA TEMP2
              STA PTR1, I
              ISZ PTR1
              LDA PTR2
              CMA
              INC
              STA PTR2
              ISZ INDEX
              BUN REVLOOP
      OUTPUT, CLA
              STA INDEX
              LDA BUFFER
              STA PTR
      OUTLOOP,LDA INDEX
              CMA
              INC
              ADD COUNT
              SZA
              BUN DONE
              LDA PTR, I
              OUT
              ISZ PTR
              ISZ INDEX
              BUN OUTLOOP
      DONE,   LDA NEWLINE
              OUT
              HLT
      COUNT,  DEC 0
      INDEX,  DEC 0
      PTR,    HEX 200
      PTR1,   HEX 200
      PTR2,   HEX 200
      CHAR,   DEC 0
      TEMP1,  DEC 0
      TEMP2,  DEC 0
      HALF,   DEC 0
      NEWLINE,DEC 10
      MAXLEN, DEC 80
      LOWERA, DEC 97
      LOWERZ, DEC 122
      DIFF,   DEC 32
      BUFFER, HEX 200
              ORG 200
      END
    `;
    expect(() => runProgram(program)).not.toThrow();
  });

  it("accepts recursive fibonacci calculator with stack operations", () => {
    const program = `
      ORG 100
      MAIN,   INP
              STA N
              BSA FIB
              LDA RESULT
              OUT
              HLT
      FIB,    HEX 0
              LDA N
              CMA
              INC
              ADD TWO
              SNA
              BUN BASECASE
              LDA SP
              STA TEMP
              LDA N
              STA TEMP, I
              ISZ SP
              LDA FIB
              STA TEMP, I
              ISZ SP
              LDA N
              CMA
              INC
              ADD ONE
              STA N
              BSA FIB
              LDA RESULT
              STA TEMP1
              LDA SP
              CMA
              INC
              STA SP
              LDA TEMP
              STA PTR
              LDA PTR, I
              STA RET
              ISZ PTR
              LDA PTR, I
              CMA
              INC
              ADD TWO
              STA N
              LDA SP
              STA TEMP
              LDA N
              STA TEMP, I
              ISZ SP
              LDA RET
              STA TEMP, I
              ISZ SP
              LDA TEMP1
              STA TEMP, I
              ISZ SP
              BSA FIB
              LDA RESULT
              STA TEMP2
              LDA SP
              CMA
              INC
              CMA
              INC
              CMA
              INC
              STA SP
              LDA TEMP1
              ADD TEMP2
              STA RESULT
              LDA SP
              STA TEMP
              ISZ TEMP
              LDA TEMP, I
              BUN FIB, I
      BASECASE,LDA N
              STA RESULT
              BUN FIB, I
      N,      DEC 0
      RESULT, DEC 0
      TEMP,   HEX 500
      TEMP1,  DEC 0
      TEMP2,  DEC 0
      PTR,    HEX 500
      RET,    HEX 0
      SP,     HEX 500
      ONE,    DEC 1
      TWO,    DEC 2
              ORG 500
      END
    `;
    expect(() => runProgram(program)).not.toThrow();
  });

  // Error test cases with complex programs

  it("rejects complex program with undefined label references", () => {
    const program = `
      ORG 100
      START,  LDA VALUE1
              ADD VALUE2
              STA RESULT
              BUN UNDEFINED_LABEL
              HLT
      VALUE1, DEC 10
      VALUE2, DEC 20
      RESULT, DEC 0
      END
    `;
    expect(() => runProgram(program)).toThrow();
  });

  it("rejects program with duplicate labels in complex context", () => {
    const program = `
      ORG 100
      LOOP,   LDA COUNT
              ISZ COUNT
              BUN LOOP
      LOOP,   HLT
      COUNT,  DEC 5
      END
    `;
    expect(() => runProgram(program)).toThrow();
  });

  it("rejects program with invalid MRI operands in subroutine", () => {
    const program = `
      ORG 100
      MAIN,   BSA SUBROUTINE
              HLT
      SUBROUTINE, HEX 0
              LDA
              ADD VALUE
              STA RESULT
              BUN SUBROUTINE, I
      VALUE,  DEC 10
      RESULT, DEC 0
      END
    `;
    expect(() => runProgram(program)).toThrow();
  });

  it("rejects program with NMRI instructions having operands", () => {
    const program = `
      ORG 100
      START,  LDA VALUE
              CLA VALUE
              HLT
      VALUE,  DEC 10
      END
    `;
    expect(() => runProgram(program)).toThrow();
  });

  it("rejects program with invalid directive operands", () => {
    const program = `
      ORG 100
      START,  LDA VALUE
              HLT
      VALUE,  DEC INVALID
      BUFFER, HEX GGGG
      END
    `;
    expect(() => runProgram(program)).toThrow();
  });

  it("rejects program with mixed indirection syntax errors", () => {
    const program = `
      ORG 100
      START,  LDA VALUE, J
              ADD DATA, I, EXTRA
              STA RESULT
              HLT
      VALUE,  DEC 10
      DATA,   DEC 20
      RESULT, DEC 0
      END
    `;
    expect(() => runProgram(program)).toThrow();
  });

  it("rejects program with labels starting with digits in complex context", () => {
    const program = `
      ORG 100
      START,  LDA VALUE
              BUN 9LOOP
              HLT
      9LOOP,  ISZ VALUE
              BUN START
      VALUE,  DEC 10
      END
    `;
    expect(() => runProgram(program)).toThrow();
  });

  it("rejects program with multiple END directives", () => {
    const program = `
      ORG 100
      MAIN,   LDA VALUE
              HLT
      END
      VALUE,  DEC 10
      END
    `;
    expect(() => runProgram(program)).toThrow();
  });

  it("rejects program with orphaned labels", () => {
    const program = `
      ORG 100
      START,  LDA VALUE
              HLT
      ORPHAN_LABEL,
      VALUE,  DEC 10
      ANOTHER_ORPHAN,
      END
    `;
    expect(() => runProgram(program)).toThrow();
  });

  it("rejects program with invalid instruction keywords", () => {
    const program = `
      ORG 100
      START,  LOAD VALUE
              ADDD TEMP
              STORE RESULT
              HALT
      VALUE,  DEC 10
      TEMP,   DEC 5
      RESULT, DEC 0
      END
    `;
    expect(() => runProgram(program)).toThrow();
  });

  it("accepts very large program with all instruction types", () => {
    const program = `
      ORG 100
      MAIN,   CLA
              INP
              STA NUM
              LDA NUM
              SZA
              BUN PROCESS
              HLT
      PROCESS,LDA NUM
              STA TEMP
              BSA FACTORIAL
              LDA RESULT
              OUT
              BUN MAIN
      FACTORIAL, HEX 0
              LDA TEMP
              CMA
              INC
              ADD ONE
              SZA
              BUN RECURSIVE
              LDA ONE
              STA RESULT
              BUN FACTORIAL, I
      RECURSIVE, LDA TEMP
              STA SAVE
              LDA TEMP
              CMA
              INC
              ADD ONE
              STA TEMP
              BSA FACTORIAL
              LDA RESULT
              STA PARTIAL
              LDA SAVE
              BSA MULTIPLY
              BUN FACTORIAL, I
      MULTIPLY, HEX 0
              CLA
              STA RESULT
              LDA PARTIAL
              STA COUNT
      MULLOOP, LDA COUNT
              SZA
              BUN MULDONE
              LDA RESULT
              ADD SAVE
              STA RESULT
              ISZ COUNT
              BUN MULLOOP
      MULDONE, BUN MULTIPLY, I
      NUM,    DEC 0
      TEMP,   DEC 0
      SAVE,   DEC 0
      RESULT, DEC 0
      PARTIAL,DEC 0
      COUNT,  DEC 0
      ONE,    DEC 1
              ORG 300
      BUFFER, DEC 0
              DEC 0
              DEC 0
              DEC 0
              DEC 0
              HEX FFFF
              HEX 0000
              HEX 1234
              HEX ABCD
              HEX 9999
      END
    `;
    expect(() => runProgram(program)).not.toThrow();
  });
});
describe("Parser Stress Tests", () => {
  it("handles very long program with many labels and references", () => {
    let program = "ORG 100\n";

    // Generate 50 labels and instructions
    for (let i = 0; i < 50; i++) {
      program += `LABEL${i}, LDA VALUE${i}\n`;
      program += `         ADD TEMP${i}\n`;
      program += `         STA RESULT${i}\n`;
      if (i < 49) {
        program += `         BUN LABEL${i + 1}\n`;
      }
    }

    program += "         HLT\n";

    // Generate data section
    for (let i = 0; i < 50; i++) {
      program += `VALUE${i}, DEC ${i * 10}\n`;
      program += `TEMP${i},  DEC ${i}\n`;
      program += `RESULT${i}, DEC 0\n`;
    }

    program += "END\n";

    expect(() => runProgram(program)).not.toThrow();
  });
});
