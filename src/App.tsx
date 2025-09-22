import { Fragment, useEffect } from "react";
import { ManoEditor } from "./components/ManoEditor";
import { Logger } from "./components/Logger";
import { useAppContext } from "./context/AppContext";
import { RegistersAndFlags } from "./components/RegsitersAndFlags";
import { Memory } from "./components/Memory";
import { Debugger } from "./components/Debugger";
import { OutputStream } from "./components/OutputStream";
import { InputStream } from "./components/InputStream";

function App() {
  const {
    compile,
    loadCompilationToSimulator,
    resetSimulator,
    microStep,
    macroStep,
  } = useAppContext();

  return (
    <Fragment>
      <div className="w-screen h-screen bg-primary-900">
        <div className="flex w-[1400px] h-[800px] flex-col  mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-3">
          <div className="w-full h-[600px] flex flex-row gap-3">
            <div
              className="w-[500px] h-full  border-solid border-black border-2 rounded-sm"
              style={{
                boxShadow: `
      rgba(255, 255, 255, 0.25) 0px 54px 55px,
      rgba(255, 255, 255, 0.12) 0px -12px 30px,
      rgba(255, 255, 255, 0.12) 0px 4px 6px,
      rgba(255, 255, 255, 0.17) 0px 12px 13px,
      rgba(255, 255, 255, 0.09) 0px -3px 5px
    `,
              }}
            >
              <ManoEditor />
            </div>

            <div className="w-[300px] h-full  flex-col gap-1">
              <div className="w-[300px] h-[300px] bg-primary-800 border-solid border-black border-2 rounded-sm">
                <Logger />
              </div>
              <button
                onMouseUp={() => compile!()}
                className="w-full h-[30px] bg-primary-800 my-1.5 rounded-sm border-solid border-black border-2 hover:bg-primary-700 cursor-pointer text-primary-600 font-bold "
              >
                Compile
              </button>
              <button
                onMouseUp={() => loadCompilationToSimulator!()}
                className="w-full h-[30px] bg-primary-800 my-1.5 rounded-sm border-solid border-black border-2 hover:bg-primary-700 cursor-pointer text-primary-600 font-bold "
              >
                Load compilation to simulator
              </button>

              <button
                onMouseUp={() => resetSimulator!()}
                className="w-full h-[30px] bg-primary-800 my-1.5 rounded-sm border-solid border-black border-2 hover:bg-primary-700 cursor-pointer text-primary-600 font-bold "
              >
                Reset simulator
              </button>

              <button
                onMouseUp={() => microStep!()}
                className="w-full h-[30px] bg-primary-800 my-1.5 rounded-sm border-solid border-black border-2 hover:bg-primary-700 cursor-pointer text-primary-600 font-bold "
              >
                Micro Step
              </button>
              <button
                onMouseUp={() => macroStep!()}
                className="w-full h-[30px] bg-primary-800 my-1.5 rounded-sm border-solid border-black border-2 hover:bg-primary-700 cursor-pointer text-primary-600 font-bold "
              >
                Macro Step
              </button>
            </div>

            <div className="w-[300px] h-full  relative flex flex-col">
              <div
                className="w-[300px] h-[300px] bg-primary-800 border-solid border-black border-2 rounded-sm relative"
                style={{
                  boxShadow: `
      rgba(255, 255, 255, 0.25) 0px 54px 55px,
      rgba(255, 255, 255, 0.12) 0px -12px 30px,
      rgba(255, 255, 255, 0.12) 0px 4px 6px,
      rgba(255, 255, 255, 0.17) 0px 12px 13px,
      rgba(255, 255, 255, 0.09) 0px -3px 5px
    `,
                }}
              >
                <span className="absolute top-[-20px] left-[20px] text-primary-100 font-bold">
                  Registers & Flags
                </span>
                <RegistersAndFlags />
              </div>
              <div
                className="w-[300px] h-[300px] bg-primary-800 border-solid border-black border-2 rounded-sm relative mt-3"
                style={{
                  boxShadow: `
      rgba(255, 255, 255, 0.25) 0px 54px 55px,
      rgba(255, 255, 255, 0.12) 0px -12px 30px,
      rgba(255, 255, 255, 0.12) 0px 4px 6px,
      rgba(255, 255, 255, 0.17) 0px 12px 13px,
      rgba(255, 255, 255, 0.09) 0px -3px 5px
    `,
                }}
              >
                <Debugger />
              </div>
            </div>

            <div
              className="w-[300px] h-full bg-primary-800 border-solid border-black border-2 rounded-sm relative"
              style={{
                boxShadow: `
      rgba(255, 255, 255, 0.25) 0px 54px 55px,
      rgba(255, 255, 255, 0.12) 0px -12px 30px,
      rgba(255, 255, 255, 0.12) 0px 4px 6px,
      rgba(255, 255, 255, 0.17) 0px 12px 13px,
      rgba(255, 255, 255, 0.09) 0px -3px 5px
    `,
              }}
            >
              <Memory />
            </div>
          </div>
          <div className="flex-1 w-full  flex flex-row gap-3">
            <div className="w-[400px] h-[200px] ">
              <OutputStream />
            </div>
            <div className="w-[500px] h-[200px] ">
              <InputStream />
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default App;
