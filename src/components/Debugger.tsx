import { Fragment } from "react/jsx-runtime";
import { useAppContext } from "../context/AppContext";
import { useState } from "react";

const toHex16 = (num: number): string =>
  `0x${num.toString(16).toUpperCase().padStart(4, "0")}`;

const toBinary = (num: number): string => num.toString(2).padStart(16, "0");

type DebuggerViewMode = "Beautify" | "Hex" | "Binary";

function Debugger() {
  const [viewMode, setViewMode] = useState<DebuggerViewMode>("Beautify");
  const { programCompiled, simulatorRef } = useAppContext();
  const programCounter = simulatorRef.current
    .getRegisters()
    .getProgramCounter(); // derived state

  const isLoaded = simulatorRef.current.isLoaded;

  return (
    <Fragment>
      <div className="flex-1 w-full h-full relative flex flex-col">
        <span className="text-primary-100 text-xs font-mono ml-2 absolute top-[-15px] left-0">
          Debugger
        </span>
        <header className="flex bg-primary-600 w-full h-[20px] flex-row items-center gap-2 justify-end p-1">
          <button
            className="w-12 h-[14px] bg-primary-800 hover:bg-primary-400 font-light text-primary-100 transition-all duration-200 cursor-pointer  flex items-center justify-center "
            style={{
              fontSize: "10px",
            }}
            onMouseUp={() => setViewMode("Beautify")}
          >
            Beautify
          </button>
          <button
            className="w-12 h-[14px] bg-primary-800 hover:bg-primary-400 font-light text-primary-100 transition-all duration-200 cursor-pointer flex items-center justify-center "
            style={{
              fontSize: "10px",
            }}
            onMouseUp={() => setViewMode("Hex")}
          >
            HEX
          </button>
          <button
            className="w-12 h-[14px] bg-primary-800 hover:bg-primary-400 font-light text-primary-100 transition-all duration-200 cursor-pointer flex items-center justify-center "
            style={{
              fontSize: "10px",
            }}
            onMouseUp={() => setViewMode("Binary")}
          >
            Binary
          </button>
        </header>

        <ul className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          {viewMode === "Beautify" && (
            <Fragment>
              {programCompiled?.instructions.map((inst, index) => {
                return (
                  <li
                    key={index}
                    className="text-primary-100 text-xs font-mono"
                  >
                    {isLoaded && programCounter === inst.origin ? (
                      <span className="bg-blue-400 w-full block">
                        {inst.srcLine}
                      </span>
                    ) : (
                      <span className=" w-full block">{inst.srcLine}</span>
                    )}
                  </li>
                );
              })}
            </Fragment>
          )}
          {viewMode === "Hex" && (
            <Fragment>
              {programCompiled?.instructions.map((inst, index) => {
                return (
                  <li
                    key={index}
                    className="text-primary-100 text-xs font-mono"
                  >
                    {isLoaded && programCounter === inst.origin ? (
                      <span className="bg-blue-400 w-full block">
                        {toHex16(inst.binary)}
                      </span>
                    ) : (
                      <span className="w-full block">
                        {toHex16(inst.binary)}
                      </span>
                    )}
                  </li>
                );
              })}
            </Fragment>
          )}

          {viewMode === "Binary" && (
            <Fragment>
              {programCompiled?.instructions.map((inst, index) => {
                return (
                  <li
                    key={index}
                    className="text-primary-100 text-xs font-mono"
                  >
                    {isLoaded && programCounter === inst.origin ? (
                      <span className="bg-blue-400 w-full block">
                        {toBinary(inst.binary)}
                      </span>
                    ) : (
                      <span className="w-full block">
                        {toBinary(inst.binary)}
                      </span>
                    )}
                  </li>
                );
              })}
            </Fragment>
          )}
        </ul>
      </div>
    </Fragment>
  );
}

export { Debugger };
