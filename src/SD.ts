const MRI_Keywords = ["AND", "ADD", "LDA", "STA", "BUN", "BSA", "ISZ"];

const REG_REF_KEYWORDS = [
  "CLA",
  "CLE",
  "CMA",
  "CME",
  "CIR",
  "CIL",
  "INC",
  "SPA",
  "SNA",
  "SZA",
  "SZE",
  "HLT",
];

const IO_KEYWORDS = ["INP", "OUT", "SKI", "SKO", "ION", "IOF"];

const DIRECTIVE_KEYWORDS = ["ORG", "END", "DEC", "HEX"];

const opCodes = {
  // MRI (memory-reference instructions, 3-bit opcodes)
  AND: 0x0,
  ADD: 0x1,
  LDA: 0x2,
  STA: 0x3,
  BUN: 0x4,
  BSA: 0x5,
  ISZ: 0x6,

  // Register-reference instructions (one word, 111 op code + bits)
  CLA: 0x7800, // Clear AC
  CLE: 0x7400, // Clear E
  CMA: 0x7200, // Complement AC
  CME: 0x7100, // Complement E
  CIR: 0x7080, // Circulate right AC and E
  CIL: 0x7040, // Circulate left AC and E
  INC: 0x7020, // Increment AC
  SPA: 0x7010, // Skip if AC positive
  SNA: 0x7008, // Skip if AC negative
  SZA: 0x7004, // Skip if AC zero
  SZE: 0x7002, // Skip if E = 0
  HLT: 0x7001, // Halt

  // I/O instructions
  INP: 0xf800, // Input character to AC
  OUT: 0xf400, // Output character from AC
  SKI: 0xf200, // Skip on input flag
  SKO: 0xf100, // Skip on output flag
  ION: 0xf080, // Interrupt on
  IOF: 0xf040, // Interrupt off
};

const MRI_OpCodes = {
  // MRI (memory-reference instructions, 3-bit opcodes)
  AND: 0x0,
  ADD: 0x1,
  LDA: 0x2,
  STA: 0x3,
  BUN: 0x4,
  BSA: 0x5,
  ISZ: 0x6,
};

const Non_MRI_OpCodes = {
  // Register-reference instructions (one word, 111 op code + bits)
  CLA: 0x7800, // Clear AC
  CLE: 0x7400, // Clear E
  CMA: 0x7200, // Complement AC
  CME: 0x7100, // Complement E
  CIR: 0x7080, // Circulate right AC and E
  CIL: 0x7040, // Circulate left AC and E
  INC: 0x7020, // Increment AC
  SPA: 0x7010, // Skip if AC positive
  SNA: 0x7008, // Skip if AC negative
  SZA: 0x7004, // Skip if AC zero
  SZE: 0x7002, // Skip if E = 0
  HLT: 0x7001, // Halt

  // I/O instructions
  INP: 0xf800, // Input character to AC
  OUT: 0xf400, // Output character from AC
  SKI: 0xf200, // Skip on input flag
  SKO: 0xf100, // Skip on output flag
  ION: 0xf080, // Interrupt on
  IOF: 0xf040, // Interrupt off
};

export {
  MRI_Keywords,
  REG_REF_KEYWORDS,
  IO_KEYWORDS,
  DIRECTIVE_KEYWORDS,
  opCodes,
  Non_MRI_OpCodes,
  MRI_OpCodes,
};
