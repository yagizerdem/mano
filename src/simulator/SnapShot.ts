const MEMORY_SIZE = 4096;

class SnapShot {
  // registers
  public AddressRegister: number = 0;
  public Accumulator: number = 0;
  public ProgramCounter: number = 0;
  public DataRegister: number = 0;
  public InstructionRegister: number = 0;
  public InputRegister: number = 0;
  public TemporaryRegister: number = 0;
  public OutputRegister: number = 0;
  public SC: number = 0;
  // memory
  public machineCodeMemory: number[] = Array(MEMORY_SIZE).fill(0);

  // flags
  public E: number = 0; // Overflow carry
  public S: number = 1; // start / stop flip flop  HLT sets flag 0 to stop computer
  public IEN: number = 0; // Interrupt Enable 1 on / 0 off
  public FGI: number = 1; // Flag Input 1 on / 0 off
  public FGO: number = 1; // Flag Output 1 on / 0 off

  // io streams
  public inputStream: number[] = [];
  public outputStream: number[] = [];
}

export { SnapShot };
