class Registers {
  private AddressRegister: number = 0;
  private Accumulator: number = 0;
  private ProgramCounter: number = 0;
  private DataRegister: number = 0;
  private InstructionRegister: number = 0;
  private InputRegister: number = 0;
  private TemporaryRegister: number = 0;
  private OutputRegister: number = 0;
  private SC: number = 0; // sequence counter

  public getAddressRegister(): number {
    return this.AddressRegister;
  }

  public setAddressRegister(value: number): void {
    this.AddressRegister = value & 0x0fff; // 12-bit register
  }

  public getAccumulator(): number {
    return this.Accumulator;
  }
  public setAccumulator(value: number): void {
    this.Accumulator = value & 0xffff; // 16-bit register
  }
  public getProgramCounter(): number {
    return this.ProgramCounter;
  }

  public setProgramCounter(value: number): void {
    this.ProgramCounter = value & 0x0fff; // 12-bit register
  }

  public getDataRegister(): number {
    return this.DataRegister;
  }
  public setDataRegister(value: number): void {
    this.DataRegister = value & 0xffff; // 16-bit register
  }

  public getInstructionRegister(): number {
    return this.InstructionRegister;
  }
  public setInstructionRegister(value: number): void {
    this.InstructionRegister = value & 0xffff; // 16-bit register
  }
  public getInputRegister(): number {
    return this.InputRegister;
  }
  public setInputRegister(value: number): void {
    this.InputRegister = value & 0x00ff; // 8-bit register
  }

  public getTemporaryRegister(): number {
    return this.TemporaryRegister;
  }

  public setTemporaryRegister(value: number): void {
    this.TemporaryRegister = value & 0xffff; // 16-bit register
  }
  public getOutputRegister(): number {
    return this.OutputRegister;
  }
  public setOutputRegister(value: number): void {
    this.OutputRegister = value & 0x00ff; // 8-bit register
  }
  public getSC(): number {
    return this.SC;
  }
  public setSC(value: number): void {
    this.SC = value & 0x000f; // 4-bit register
  }
}

export { Registers };
