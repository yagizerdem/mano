import { Fragment, useEffect, useRef } from "react";
import { ManoEditor } from "./components/ManoEditor";
import { Logger } from "./components/Logger";
import { useAppContext } from "./context/AppContext";
import { RegistersAndFlags } from "./components/RegsitersAndFlags";
import { Memory } from "./components/Memory";
import { Debugger } from "./components/Debugger";
import { OutputStream } from "./components/OutputStream";
import { InputStream } from "./components/InputStream";
import { Visual } from "./components/Visual";
import gsap from "gsap";

function App() {
  const {
    compile,
    loadCompilationToSimulator,
    resetSimulator,
    microStep,
    macroStep,
    showVisualizer,
    setShowVisualizer,
    setBusTransfers,
    animationSpeed,
    setAnimationSpeed,
  } = useAppContext();

  const visualizerRef = useRef<HTMLDivElement>(null);

  return (
    <Fragment>
      <div className="w-screen h-screen bg-primary-900 flex flex-row items-center justify-center overflow-auto">
        <div className="flex flex-row w-screen h-[800px] p-4">
          <div className="flex flex-col  mx-auto  gap-3">
            <div className="w-full h-[600px] flex flex-row gap-3 justify-center">
              <div
                className="w-[400px] h-full  border-solid border-black border-2 rounded-sm"
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
            <div className="flex-1 w-full  flex flex-row gap-3 justify-center">
              <div className="w-[400px] h-[200px] ">
                <OutputStream />
              </div>
              <div className="w-[500px] h-[200px] ">
                <InputStream />
              </div>
            </div>
          </div>
          <div className="flex flex-col h-full">
            <div className="flex flex-row w-fit h-8 gap-2 absolute top-4 right-4 z-10 bg-primary-900 p-2 rounded-sm border-solid border-black border-2">
              {/* checkbox row */}
              <div className="flex items-center flex-row">
                <input
                  checked={showVisualizer}
                  id="checked-checkbox"
                  type="checkbox"
                  className="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft cursor-pointer"
                  onChange={(e) => {
                    setBusTransfers([]);
                    setShowVisualizer(e.target.checked);
                  }}
                />

                <label
                  htmlFor="checked-checkbox"
                  className="select-none ms-2 text-sm font-medium text-white font-bold w-30"
                >
                  Show Visualizer
                </label>
              </div>

              <div className="flex items-center flex-row">
                <label
                  htmlFor="animation-speed"
                  className="select-none ms-2 text-sm font-medium text-white font-bold w-fit"
                >
                  Animation Speed
                </label>

                {/* range input */}
                <input
                  id="animation-speed"
                  type="range"
                  defaultValue={100}
                  max={300}
                  min={50}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-quaternary rounded-full appearance-none cursor-pointer bg-gray-700"
                />
                <span className="ms-2  text-sm font-medium text-white font-bold w-40">
                  {`(${animationSpeed}/100) %`}
                </span>
              </div>
            </div>

            <div
              ref={visualizerRef}
              className={`
      h-full overflow-hidden transition-all duration-500 ease-out
      ${showVisualizer ? "w-[500px] opacity-100" : "w-0 opacity-0"}
    `}
            >
              <div
                className="w-[500px] h-full bg-primary-800 border-solid border-black border-2 rounded-sm relative"
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
                {showVisualizer && <Visual />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default App;
