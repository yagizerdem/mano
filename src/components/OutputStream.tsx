import { Fragment } from "react/jsx-runtime";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";

function OutputStream() {
  const { snapShot } = useAppContext();
  const [outputStream, setOutputStream] = useState<number[]>([]);

  useEffect(() => {
    if (snapShot?.outputStream.length == 0) {
      setOutputStream([]);
    }
    if (snapShot && snapShot.outputStream.length !== outputStream.length) {
      const rest = snapShot.outputStream.slice(outputStream.length);
      setOutputStream((prev) => [...prev, ...rest]);
    }
  }, [snapShot, snapShot?.outputStream, outputStream.length]);

  return (
    <Fragment>
      <div className="w-full h-full bg-primary-800 rounded-sm border-2 border-solid border-black relative p-2 ">
        <span className="absolute top-[-20px] left-[20px] text-primary-100 font-bold">
          Output Stream
        </span>
        <ul className="space-y-1 overflow-y-auto h-full pr-2">
          {outputStream.map((value, index) => {
            const dec = value;
            const bin = value.toString(2).padStart(8, "0"); // 8-bit binary
            const hex = value.toString(16).toUpperCase().padStart(2, "0");
            return (
              <li key={index} className="text-primary-100 font-mono text-sm">
                DEC: {dec} | BIN: {bin} | HEX: 0x{hex}
              </li>
            );
          })}
        </ul>
      </div>
    </Fragment>
  );
}

export { OutputStream };
