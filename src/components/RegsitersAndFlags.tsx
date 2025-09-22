import { Fragment } from "react/jsx-runtime";
import { useAppContext } from "../context/AppContext";

const toHex16 = (num: number): string =>
  `0x${num.toString(16).toUpperCase().padStart(4, "0")}`;

function RegistersAndFlags() {
  const { snapShot } = useAppContext();
  return (
    <Fragment>
      <div className="w-full h-full ">
        <div className="grid grid-cols-4 grid-rows-4 gap-1 p-2">
          {/* Data register  */}
          <div className=" flex flex-col text-white text-sm items-center justify-center my-2">
            <span>DR</span>
            <div className="w-full bg-primary-700 rounded-sm font-bold text-center">
              {toHex16(snapShot!.DataRegister)}
            </div>
          </div>

          {/* Address register  */}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>AR</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold text-center">
              {toHex16(snapShot!.AddressRegister)}
            </div>
          </div>

          {/* Accumulator  */}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>AC</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold  text-center">
              {toHex16(snapShot!.Accumulator)}
            </div>
          </div>

          {/* Instruction Register */}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>IR</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold  text-center">
              {toHex16(snapShot!.InstructionRegister)}
            </div>
          </div>

          {/* Program counter */}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>PC</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold text-center">
              {toHex16(snapShot!.ProgramCounter)}
            </div>
          </div>

          {/* Temp register */}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>TR</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold  text-center">
              {toHex16(snapShot!.TemporaryRegister)}
            </div>
          </div>

          {/* Input Register */}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>INP</span>
            <div className="w-full bg-primary-700 rounded-sm font-bold text-center">
              {toHex16(snapShot!.InputRegister)}
            </div>
          </div>

          {/* Output Register */}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>OUT</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold text-center">
              {toHex16(snapShot!.OutputRegister)}
            </div>
          </div>

          {/* Sequence Counter */}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>SC</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold  text-center">
              {toHex16(snapShot!.SC)}
            </div>
          </div>

          {/* Flags */}
          {/* Carry out */}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>E</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold  text-center">
              {snapShot!.E === 0 ? "False" : "True"}
            </div>
          </div>

          {/*Halt*/}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>S</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold  text-center">
              {snapShot!.S === 0 ? "False" : "True"}
            </div>
          </div>

          {/*Interrupt enable*/}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>IEN</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold  text-center">
              {snapShot!.IEN === 0 ? "False" : "True"}
            </div>
          </div>

          {/*Flag Input*/}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>FGI</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold text-center">
              {snapShot!.FGI === 0 ? "False" : "True"}
            </div>
          </div>

          {/*Flag Output*/}
          <div className=" flex flex-col text-white text-sm items-center justify-center">
            <span>FGO</span>
            <div className="w-full  bg-primary-700 rounded-sm font-bold  text-center">
              {snapShot!.FGO === 0 ? "False" : "True"}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export { RegistersAndFlags };
