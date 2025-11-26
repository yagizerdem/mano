# Mano

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works (Short Explanation)](#how-it-works-short-explanation)
- [How to Run Locally](#how-to-run-locally)
- [Future Improvements](#future-improvements)
- [License](#license)
- [Author](#author)

## Project Overview

This is an online Mano assembly compiler and simulator designed for electrical, electronics, and computer engineering students. It allows users to experiment with and debug Mano code, while gaining deeper insight into assembly programming and how a CPU works under the hood

### Live Demo: <br/>

https://yagizerdem.github.io/mano/

## Features

- **Built-in debugger**
- **Syntax checking powered by a custom parser**
- **VS Code–style code editor with syntax highlighting**
- **Import and export support for Mano programs**
- **Detailed logger that records every micro-operation step**

## Tech Stack

- **React**
- **TypeScript**
- **Vite**

## How It Works

This project implements a full Mano assembly toolchain written entirely in TypeScript, consisting of a **Lexer**, **Parser**, and a **Two-Pass Assembler**.  
The system strictly follows the grammar rules of the Mano Basic Computer architecture and converts assembly programs into 16-bit machine code.

---

### 🔹 1. Lexer — Token Generation

The **Lexer** reads the raw assembly input line by line and performs:

- Uppercasing and comment stripping (`//`)
- Lexeme extraction with regex
- Character validation (`A–Z`, `0–9`, `_`, `,`)
- Token classification:
  - `KEYWORD` (MRI, register-ref, I/O, directives)
  - `IDENTIFIER`
  - `NUMBER_DEC`
  - `NUMBER_HEX`
  - `INDIRECTION` token (`I` after an operand)

It also tracks:

- Source line
- Column number
- Original source text (for debugging)

If a malformed token is detected, the Lexer throws `LexerException` with detailed coordinates.

---

### 🔹 2. Parser — Grammar & Syntactic Validation

The **Parser** is a recursive-descent parser that enforces the official Mano grammar:

### 🔹 3. Mano Assembly

Users can write Mano assembly code directly inside the VS Code–style editor.

If the program makes use of **I/O instructions**, the user must also provide input values through the **Input Stream**.

The **Input Stream** acts as an internal stack-like buffer:

- Characters entered by the user are stored as raw chars.
- Each character is then mapped to its ASCII value.
- On every `INP` instruction, the **top element** of the stream is consumed.

The **Output Stream** displays the output register’s value whenever the program executes an `OUT` instruction.

For **CPU-bound programs** (programs without I/O operations), do **not** use the Input or Output Streams.

### Mano Instruction Set

| Bit 15 | Bits 14–12 | Bits 11–0        | Mnemonic | Description                                                       |
| ------ | ---------- | ---------------- | -------- | ----------------------------------------------------------------- |
| 0      | 0          | (Direct address) | AND      | And direct memory to accumulator                                  |
| 0      | 1          | (Direct address) | ADD      | Add direct memory to accumulator (affects carry bit)              |
| 0      | 2          | (Direct address) | LDA      | Load direct memory to accumulator                                 |
| 0      | 3          | (Direct address) | STA      | Store accumulator to direct memory                                |
| 0      | 4          | (Direct address) | BUN      | Unconditionally branch to direct memory                           |
| 0      | 5          | (Direct address) | BSA      | Store current program counter to direct memory and branch to next |
| 0      | 6          | (Direct address) | ISZ      | Increment value in direct memory and skip next if the sum is zero |
| 1      | 0–6        | (Indirect addr.) | —        | Indirect addressing versions of the above instructions            |
| 0      | 7          | 800              | CLA      | Clear the accumulator                                             |
| 0      | 7          | 400              | CLE      | Clear the carry bit                                               |
| 0      | 7          | 200              | CMA      | Complement the accumulator                                        |
| 0      | 7          | 100              | CME      | Complement the carry bit                                          |
| 0      | 7          | 080              | CIR      | Circulate accumulator right (through carry bit)                   |
| 0      | 7          | 040              | CIL      | Circulate accumulator left (through carry bit)                    |
| 0      | 7          | 020              | INC      | Increment accumulator (does not affect carry bit)                 |
| 0      | 7          | 010              | SPA      | Skip next instruction if accumulator is positive                  |
| 0      | 7          | 008              | SNA      | Skip next instruction if accumulator is negative                  |
| 0      | 7          | 004              | SZA      | Skip next instruction if accumulator is zero                      |
| 0      | 7          | 002              | SZE      | Skip next instruction if carry bit is zero                        |
| 0      | 7          | 001              | HLT      | Halt computer by clearing the halt bit latch                      |
| 1      | 7          | 800              | INP      | Input from character bus to accumulator                           |
| 1      | 7          | 400              | OUT      | Output accumulator to character bus                               |
| 1      | 7          | 200              | SKI      | Skip next instruction if input flag is set                        |
| 1      | 7          | 100              | SKO      | Skip next instruction if output flag is set                       |
| 1      | 7          | 080              | ION      | Enable interrupts                                                 |
| 1      | 7          | 040              | IOF      | Disable interrupts                                                |

### 🔹 4. How to use simulator

1. Enter your mano assembly code into code editor.
2. Compile program
3. Load Simulator
4. Execute micro|macro steps. Micro steps executes one micro operations at time . Macro steps executes all micro operations related to insturction in one go.

**Notes**

- after successfully load simulator and executre micro|macro steps. you can hit load simulator again to refresh register and memory states.

- if you change your source assembly code after binaries loaded into memory, you can apply compilation and load simulator to recompile program and reapply your changes

## How to Run Locally

1. **Clone or download** the repository to your local machine.  
   _Do not change or rename any folder paths._

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and enjoy 🚀

## Future Improvements

- **CPU Execution Visualization**
  Show pipeline-style execution flow (fetch → decode → execute) with animations.

- **Memory Heatmap**
  Display read/write frequency visually to help users understand memory behavior.

- **Program Analyzer**
  Automatically detect unreachable code, infinite loops, or unused labels.

- **More I/O Devices**
  Add virtual devices such as keyboard buffer, screen buffer, timers, and ports.

## License

Released under MIT License

## Author

**Yağız Erdem**<br/>

Computer Engineering, Dokuz Eylül University <br/>

GitHub: https://github.com/yagizerdem <br/>
Email: yagizerdem819@gmail.com <br/>
