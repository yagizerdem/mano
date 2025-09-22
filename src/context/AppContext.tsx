import React, {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Simulator } from "../simulator/Simulator";
import { Assembler, Program } from "../assembler/Assembler";
import { LexerException } from "../assembler/LexerException";
import { logger } from "../simulator/Logger";
import { ParseException } from "../assembler/ParseException";
import { AssemblerException } from "../assembler/AssemblerException";
import { SnapShot } from "../simulator/SnapShot";

// Context type definition
type AppContextType = {
  program: string;
  setProgram: (p: string) => void;
  simulatorRef: React.MutableRefObject<Simulator>;
  programCompiled?: Program | null;
  setProgramCompiled?: (p: Program | null) => void;
  compile?: () => void;
  loadCompilationToSimulator?: () => void;
  resetSimulator?: () => void;
  microStep?: () => void;
  macroStep?: () => void;
  snapShot?: SnapShot;
  setSnapShot?: (s: SnapShot) => void;
  inputStream: number[];
  setInputStream: React.Dispatch<React.SetStateAction<number[]>>;
};

// Default value (will be overridden by the Provider)
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const simulatorRef = useRef(new Simulator()); // created only once
  const [program, setProgram] = useState<string>("");
  const [programCompiled, setProgramCompiled] = useState<Program | null>(null);
  const [snapShot, setSnapShot] = useState<SnapShot>(new SnapShot());
  const [inputStream, setInputStream] = useState<number[]>([]);

  function compile() {
    try {
      const assembler = new Assembler(program);
      const programCompiled: Program = assembler.assemble();
      setProgramCompiled(programCompiled);
      logger.success("ASSEMBLER", "Program compiled successfully.");
    } catch (e) {
      console.error(e);

      if (e instanceof LexerException) {
        logger.error("LEXER", `${e.message}`);
      }
      if (e instanceof ParseException) {
        logger.error("PARSER", `${e.message}`);
      }

      if (e instanceof AssemblerException) {
        logger.error("ASSEMBLER", `${e.message}`);
      }
    }
  }

  function loadCompilationToSimulator() {
    if (programCompiled) {
      // at least 1 instruction is needed to simulate
      if (programCompiled.instructions.length === 0) {
        logger.error("SYSTEM", "No instructions found in compiled program.");
        return;
      }

      simulatorRef.current.initilizeSimulator(programCompiled);

      const snapShot: SnapShot = simulatorRef.current.getSnapShot();
      setSnapShot(snapShot);

      simulatorRef.current.inputStream = [...inputStream];

      logger.success("SYSTEM", "Program loaded into simulator successfully.");
    } else {
      logger.error("SYSTEM", "No compiled program to load into simulator.");
    }
  }

  function resetSimulator() {
    simulatorRef.current.reset();
    const snapShot: SnapShot = simulatorRef.current.getSnapShot();
    setSnapShot(snapShot);
    setInputStream([]);
  }

  function microStep() {
    if (!simulatorRef.current.isLoaded) {
      logger.error("SYSTEM", "No program loaded into simulator.");
      return;
    }

    simulatorRef.current.microStep();
    // get snapshot
    const snapShot: SnapShot = simulatorRef.current.getSnapShot();
    setSnapShot(snapShot);
  }

  function macroStep() {
    if (!simulatorRef.current.isLoaded) {
      logger.error("SYSTEM", "No program loaded into simulator.");
      return;
    }

    simulatorRef.current.macroStep();
    // get snapshot
    const snapShot: SnapShot = simulatorRef.current.getSnapShot();
    setSnapShot(snapShot);
  }

  return (
    <AppContext.Provider
      value={{
        program,
        setProgram,
        simulatorRef,
        programCompiled,
        setProgramCompiled,
        compile,
        loadCompilationToSimulator,
        resetSimulator,
        microStep,
        macroStep,
        snapShot,
        setSnapShot,
        inputStream,
        setInputStream,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to consume the context
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
};
