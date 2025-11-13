import type { Instruction, Program } from "../assembler/Assembler";
import { MRI_OpCodes, Non_MRI_OpCodes, REG_REF_KEYWORDS } from "../SD";
import { Flags } from "./Flags";
import { logger } from "./Logger";
import { Registers } from "./Registers";
import { SnapShot } from "./SnapShot";

const toHex16 = (num: number): string =>
  num.toString(16).toUpperCase().padStart(4, "0");

const toHex12 = (num: number): string =>
  num.toString(16).toUpperCase().padStart(3, "0");

const toHex8 = (num: number): string =>
  num.toString(16).toUpperCase().padStart(2, "0");

// 4096 bytes 4KB ram
const MEMORY_SIZE = 4096;
class Memory {
  public machineCodeMemory: number[];
  public codeMemory: Instruction[];
  constructor() {
    this.machineCodeMemory = new Array(MEMORY_SIZE).fill(0);
    this.codeMemory = new Array(MEMORY_SIZE).fill(null);
  }
}

class Simulator {
  private registers: Registers;
  private flags: Flags;
  public memory: Memory;
  public program!: Program;

  public isLoaded: boolean = false;

  public outputStream: number[] = [];
  public inputStream: number[] = [];

  constructor() {
    this.registers = new Registers();
    this.flags = new Flags();
    this.memory = new Memory();
  }

  public reset(): void {
    this.registers = new Registers();
    this.flags = new Flags();
    this.memory = new Memory();
    this.isLoaded = false;
    this.outputStream = [];
    this.inputStream = [];
  }

  public initilizeSimulator(program: Program) {
    this.reset();
    this.program = program;

    // setup memory
    for (const inst of program.instructions) {
      this.memory.machineCodeMemory[inst.origin] = inst.binary;
      this.memory.codeMemory[inst.origin] = inst;
    }

    for (const data of program.data) {
      this.memory.machineCodeMemory[data.origin] = data.binary;
    }

    // set PC to starting address
    // start origin is first instruction's origin
    this.registers.setProgramCounter(this.program.instructions[0].origin);

    this.isLoaded = true;
  }

  public setInputStream(inputQueue: number[]) {
    this.inputStream = inputQueue;
  }

  public microStep() {
    if (this.flags.S === 0) return;

    // handle output
    if (this.flags.FGO === 0 && this.registers.getSC() === 0) {
      const value = this.registers.getOutputRegister();
      this.outputStream.push(value);
      this.flags.FGO = 1; // set FGO back to 1 after output is read
    }

    // handle input
    if (
      this.flags.FGI === 0 &&
      this.registers.getSC() === 0 &&
      this.inputStream.length > 0
    ) {
      const next = this.inputStream.shift()!;
      this.registers.setInputRegister(next & 0xff);
      const highByte = this.registers.getAccumulator() & 0xff00;
      const lowByte = this.registers.getInputRegister() & 0x00ff;
      this.registers.setAccumulator(highByte | lowByte);

      this.flags.FGI = 1; // set FGI back to 1 after input is read
    }

    const ticks = [
      this.t0,
      this.t1,
      this.t2,
      this.t3,
      this.t4,
      this.t5,
      this.t6,
    ];

    const currentTick = ticks.at(this.registers.getSC())!.bind(this)!;

    currentTick();
  }

  public macroStep() {
    if (this.flags.S === 0) return;

    const currentSequence = this.registers.getSC();
    if (currentSequence === 0) this.microStep();
    while (this.registers.getSC() !== 0) {
      this.microStep();
    }
  }

  public run() {
    while (this.flags.S === 1) {
      this.microStep();
    }
  }

  public t0() {
    // AR <- PC
    this.registers.setAddressRegister(this.registers.getProgramCounter());
    this.registers.setSC(this.registers.getSC() + 1);

    logger.info(
      "FETCH",
      `AR <- PC = ${toHex12(this.registers.getAddressRegister())}`
    );
  }

  public t1() {
    // IR <- M[AR], PC <- PC + 1

    this.registers.setInstructionRegister(
      this.memory.machineCodeMemory[this.registers.getAddressRegister()]
    );
    this.registers.setProgramCounter(this.registers.getProgramCounter() + 1);
    this.registers.setSC(this.registers.getSC() + 1);

    logger.info(
      "FETCH",
      `IR <- M[AR] = ${toHex16(this.registers.getInstructionRegister())}`
    );

    logger.info(
      "FETCH",
      `PC <- PC + 1 = ${toHex12(this.registers.getProgramCounter())}`
    );
  }

  public t2() {
    // decode D0- D7 <- IR(12-14) AR <- IR(0-11) I <- IR(15)
    const instruction = this.registers.getInstructionRegister();
    const opcode = (instruction >> 12) & 0x7;
    const address = instruction & 0x0fff;
    const indirection = (instruction >> 15) & 0x1;
    this.registers.setAddressRegister(address);

    logger.info("DECODE", "D0-D7 <- IR(12-14)");
    logger.info("DECODE", `AR <- IR(0-11) = ${toHex12(address)}`);
    logger.info("DECODE", `I <- IR(15) = ${indirection}`);

    this.registers.setSC(this.registers.getSC() + 1);
  }

  public t3() {
    const instruction = this.registers.getInstructionRegister();
    const opcode = (instruction >> 12) & 0x7;
    const address = instruction & 0x0fff;
    const indirection = (instruction >> 15) & 0x1;

    // Memory Reference Instructions
    if (Object.values(MRI_OpCodes).includes(opcode)) {
      if (indirection === 1) {
        // AR <- M[AR]
        this.registers.setAddressRegister(
          this.memory.machineCodeMemory[this.registers.getAddressRegister()]
        );
        logger.info(
          "EXECUTE_MRI",
          `AR <- M[AR] = ${toHex12(this.registers.getAddressRegister())}`
        );
      } else {
        logger.info("EXECUTE_MRI", "No Indirection");
      }

      this.registers.setSC(this.registers.getSC() + 1);
    } else {
      if (Object.values(Non_MRI_OpCodes).includes(instruction)) {
        // handle register ref and io instructions
        switch (instruction) {
          // Register Reference Instructions
          case Non_MRI_OpCodes.CLA: {
            this.registers.setAccumulator(0);
            logger.info("EXECUTE_NMRI", "CLA: AC <- 0");
            break;
          }

          case Non_MRI_OpCodes.CLE: {
            this.flags.E = 0;
            logger.info("EXECUTE_NMRI", "CLE: E <- 0");
            break;
          }

          case Non_MRI_OpCodes.CMA: {
            this.registers.setAccumulator(~this.registers.getAccumulator());
            logger.info("EXECUTE_NMRI", "CMA: AC <- ~AC");
            break;
          }

          case Non_MRI_OpCodes.CME: {
            this.flags.E = this.flags.E === 0 ? 1 : 0;
            logger.info("EXECUTE_NMRI", "CME: E <- ~E");
            break;
          }

          case Non_MRI_OpCodes.CIR: {
            const lsb = this.registers.getAccumulator() & 0x1;
            const oldE = this.flags.E;
            const newAc = (this.registers.getAccumulator() >> 1) | (oldE << 15);
            this.registers.setAccumulator(newAc);
            this.flags.E = lsb;
            logger.info(
              "EXECUTE_NMRI",
              `CIR: AC <- ${toHex16(newAc)}, E <- ${lsb}`
            );

            break;
          }

          case Non_MRI_OpCodes.CIL: {
            const msb = (this.registers.getAccumulator() >> 15) & 0x1;
            const oldE = this.flags.E;
            const newAc = (this.registers.getAccumulator() << 1) | oldE;
            this.registers.setAccumulator(newAc);
            this.flags.E = msb;

            logger.info(
              "EXECUTE_NMRI",
              `CIL: AC <- ${toHex16(newAc)}, E <- ${msb}`
            );
            break;
          }

          case Non_MRI_OpCodes.INC: {
            this.registers.setAccumulator(this.registers.getAccumulator() + 1);
            logger.info(
              "EXECUTE_NMRI",
              `INC: AC <- AC + 1 = ${toHex16(this.registers.getAccumulator())}`
            );
            break;
          }

          case Non_MRI_OpCodes.SPA: {
            const sign = (this.registers.getAccumulator() >> 15) & 0x1;
            if (sign === 0) {
              this.registers.setProgramCounter(
                this.registers.getProgramCounter() + 1
              );
              logger.info(
                "EXECUTE_NMRI",
                `SPA: AC(15) = 0, so PC <- PC + 1 = ${toHex12(
                  this.registers.getProgramCounter()
                )}`
              );
            } else {
              logger.info("EXECUTE_NMRI", `SPA: AC(15) = 1, no action`);
            }
            break;
          }

          case Non_MRI_OpCodes.SNA: {
            const sign = (this.registers.getAccumulator() >> 15) & 0x1;
            if (sign === 1) {
              this.registers.setProgramCounter(
                this.registers.getProgramCounter() + 1
              );
              logger.info(
                "EXECUTE_NMRI",
                `SNA: AC(15) = 1, so PC <- PC + 1 = ${toHex12(
                  this.registers.getProgramCounter()
                )}`
              );
            } else {
              logger.info("EXECUTE_NMRI", `SNA: AC(15) = 0, no action`);
            }
            break;
          }

          case Non_MRI_OpCodes.SZA: {
            if (this.registers.getAccumulator() === 0) {
              this.registers.setProgramCounter(
                this.registers.getProgramCounter() + 1
              );
              logger.info(
                "EXECUTE_NMRI",
                `SZA: AC = 0, so PC <- PC + 1 = ${toHex12(
                  this.registers.getProgramCounter()
                )}`
              );
            } else {
              logger.info("EXECUTE_NMRI", `SZA: AC != 0, no action`);
            }
            break;
          }

          case Non_MRI_OpCodes.SZE: {
            if (this.flags.E === 0) {
              this.registers.setProgramCounter(
                this.registers.getProgramCounter() + 1
              );
              logger.info(
                "EXECUTE_NMRI",
                `SZE: E = 0, so PC <- PC + 1 = ${toHex12(
                  this.registers.getProgramCounter()
                )}`
              );
            } else {
              logger.info("EXECUTE_NMRI", `SZE: E != 0, no action`);
            }
            break;
          }

          case Non_MRI_OpCodes.HLT: {
            this.flags.S = 0;
            logger.info("EXECUTE_NMRI", `HLT: S <- 0`);
            break;
          }

          // Input-Output Instructions
          case Non_MRI_OpCodes.INP: {
            const highByte = this.registers.getAccumulator() & 0xff00;
            const lowByte = this.registers.getInputRegister() & 0x00ff;
            this.registers.setAccumulator(highByte | lowByte);

            this.flags.FGI = 0;
            logger.info(
              "EXECUTE_NMRI",
              `INP: AC(0–7) <- INPR = ${toHex8(lowByte)}, AC = ${toHex16(
                this.registers.getAccumulator()
              )}, FGI <- 0`
            );

            break;
          }

          case Non_MRI_OpCodes.OUT: {
            this.registers.setOutputRegister(
              this.registers.getAccumulator() & 0x00ff
            );
            this.flags.FGO = 0;
            logger.info(
              "EXECUTE_NMRI",
              `OUT: OUTR <- AC(0–7) = ${toHex8(
                this.registers.getOutputRegister()
              )}, FGO <- 0`
            );

            break;
          }

          case Non_MRI_OpCodes.SKI: {
            if (this.flags.FGI === 1) {
              this.registers.setProgramCounter(
                this.registers.getProgramCounter() + 1
              );
              logger.info(
                "EXECUTE_NMRI",
                `SKI: FGI = 1, so PC <- PC + 1 = ${toHex12(
                  this.registers.getProgramCounter()
                )}`
              );
            } else {
              logger.info("EXECUTE_NMRI", `SKI: FGI = 0, no action`);
            }

            break;
          }

          case Non_MRI_OpCodes.SKO: {
            if (this.flags.FGO === 1) {
              this.registers.setProgramCounter(
                this.registers.getProgramCounter() + 1
              );
              logger.info(
                "EXECUTE_NMRI",
                `SKO: FGO = 1, so PC <- PC + 1 = ${toHex12(
                  this.registers.getProgramCounter()
                )}`
              );
            } else {
              logger.info("EXECUTE_NMRI", `SKO: FGO = 0, no action`);
            }

            break;
          }

          case Non_MRI_OpCodes.ION: {
            this.flags.IEN = 1;
            logger.info("EXECUTE_NMRI", `ION: IEN <- 1`);
            break;
          }

          case Non_MRI_OpCodes.IOF: {
            this.flags.IEN = 0;
            logger.info("EXECUTE_NMRI", `IOF: IEN <- 0`);
            break;
          }
        }

        this.registers.setSC(0);
      }
    }
  }

  public t4() {
    const instruction = this.registers.getInstructionRegister();
    const opcode = (instruction >> 12) & 0x7;
    const address = instruction & 0x0fff;
    const indirection = (instruction >> 15) & 0x1;

    // Memory Reference Instructions
    switch (opcode) {
      case MRI_OpCodes.AND:
      case MRI_OpCodes.ADD:
      case MRI_OpCodes.LDA: {
        this.registers.setDataRegister(
          this.memory.machineCodeMemory[this.registers.getAddressRegister()]
        );
        logger.info(
          "EXECUTE_MRI",
          `DR <- M[AR] = ${toHex16(this.registers.getDataRegister())}`
        );
        break;
      }
      case MRI_OpCodes.STA: {
        this.memory.machineCodeMemory[this.registers.getAddressRegister()] =
          this.registers.getAccumulator();

        this.registers.setSC(0);

        logger.info(
          "EXECUTE_MRI",
          `STA: M[AR] <- AC = ${toHex16(
            this.registers.getAccumulator()
          )}, SC <- 0`
        );
        return;
      }
      case MRI_OpCodes.BUN: {
        this.registers.setProgramCounter(this.registers.getAddressRegister());
        this.registers.setSC(0);
        logger.info(
          "EXECUTE_MRI",
          `BUN: PC <- AR = ${toHex12(
            this.registers.getProgramCounter()
          )}, SC <- 0`
        );
        return;
      }
      case MRI_OpCodes.BSA: {
        this.memory.machineCodeMemory[this.registers.getAddressRegister()] =
          this.registers.getProgramCounter();

        this.registers.setAddressRegister(
          this.registers.getAddressRegister() + 1
        );

        break;
      }

      case MRI_OpCodes.ISZ: {
        this.registers.setDataRegister(
          this.memory.machineCodeMemory[this.registers.getAddressRegister()]
        );

        logger.info(
          "EXECUTE_MRI",
          `DR <- M[AR] = ${toHex16(this.registers.getDataRegister())}`
        );

        break;
      }
    }

    this.registers.setSC(this.registers.getSC() + 1);
  }

  public t5() {
    const instruction = this.registers.getInstructionRegister();
    const opcode = (instruction >> 12) & 0x7;
    const address = instruction & 0x0fff;
    const indirection = (instruction >> 15) & 0x1;

    // Memory Reference Instructions
    switch (opcode) {
      case MRI_OpCodes.AND: {
        this.registers.setAccumulator(
          this.registers.getAccumulator() & this.registers.getDataRegister()
        );
        logger.info(
          "EXECUTE_MRI",
          `AND: AC <- AC & DR = ${toHex16(this.registers.getAccumulator())}`
        );
        this.registers.setSC(0);

        return;
      }

      case MRI_OpCodes.ADD: {
        const Cout =
          ((this.registers.getAccumulator() +
            this.registers.getDataRegister()) >>
            16) &
          0x1;
        this.registers.setAccumulator(
          this.registers.getAccumulator() + this.registers.getDataRegister()
        );

        this.flags.E = Cout;
        logger.info(
          "EXECUTE_MRI",
          `ADD: AC <- AC + DR = ${toHex16(
            this.registers.getAccumulator()
          )}, E <- ${Cout}`
        );
        this.registers.setSC(0);

        return;
      }

      case MRI_OpCodes.LDA: {
        this.registers.setAccumulator(this.registers.getDataRegister());
        this.registers.setSC(0);
        logger.info(
          "EXECUTE_MRI",
          `LDA: AC <- DR = ${toHex16(this.registers.getAccumulator())}`
        );
        return;
      }

      case MRI_OpCodes.BSA: {
        this.registers.setProgramCounter(this.registers.getAddressRegister());
        this.registers.setSC(0);
        logger.info(
          "EXECUTE_MRI",
          `BSA: PC <- AR = ${toHex12(
            this.registers.getProgramCounter()
          )}, SC <- 0`
        );
        return;
      }

      case MRI_OpCodes.ISZ: {
        this.registers.setDataRegister(this.registers.getDataRegister() + 1);

        this.registers.setSC(this.registers.getSC() + 1);

        logger.info(
          "EXECUTE_MRI",
          `ISZ: DR <- DR + 1 = ${toHex16(this.registers.getDataRegister())}`
        );

        break;
      }
    }
  }

  public t6() {
    // only ISZ reaches here

    this.memory.machineCodeMemory[this.registers.getAddressRegister()] =
      this.registers.getDataRegister();

    logger.info(
      "EXECUTE_MRI",
      `M[AR] <- DR = ${toHex16(this.registers.getDataRegister())}`
    );

    if (this.registers.getDataRegister() === 0) {
      this.registers.setProgramCounter(this.registers.getProgramCounter() + 1);
      logger.info(
        "EXECUTE_MRI",
        `ISZ: DR = 0, so PC <- PC + 1 = ${toHex12(
          this.registers.getProgramCounter()
        )}`
      );
    } else {
      logger.info("EXECUTE_MRI", `ISZ: DR != 0, no action`);
    }
    this.registers.setSC(0);
  }

  public getSnapShot(): SnapShot {
    const snapShot = new SnapShot();
    snapShot.AddressRegister = this.registers.getAddressRegister();
    snapShot.Accumulator = this.registers.getAccumulator();
    snapShot.ProgramCounter = this.registers.getProgramCounter();
    snapShot.DataRegister = this.registers.getDataRegister();
    snapShot.InstructionRegister = this.registers.getInstructionRegister();
    snapShot.InputRegister = this.registers.getInputRegister();
    snapShot.TemporaryRegister = this.registers.getTemporaryRegister();
    snapShot.OutputRegister = this.registers.getOutputRegister();
    snapShot.SC = this.registers.getSC();
    snapShot.machineCodeMemory = [...this.memory.machineCodeMemory];
    snapShot.E = this.flags.E;
    snapShot.S = this.flags.S;
    snapShot.IEN = this.flags.IEN;
    snapShot.FGI = this.flags.FGI;
    snapShot.FGO = this.flags.FGO;
    snapShot.inputStream = [];
    snapShot.outputStream = [...this.outputStream];

    return snapShot;
  }

  public getRegisters(): Registers {
    return this.registers;
  }
}

export { Simulator };
