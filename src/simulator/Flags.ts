class Flags {
  public E: number = 0; // Overflow carry
  public S: number = 1; // start / stop flip flop  HLT sets flag 0 to stop computer
  public IEN: number = 0; // Interrupt Enable 1 on / 0 off
  public FGI = 1; // Flag Input 1 on / 0 off
  public FGO = 1; // Flag Output 1 on / 0 off
}

export { Flags };
