import { Fragment } from "react/jsx-runtime";
import { useAppContext } from "../context/AppContext";

const toHex16 = (num: number): string =>
  `0x${num.toString(16).toUpperCase().padStart(4, "0")}`;

function Memory() {
  const { snapShot, setSnapShot } = useAppContext();

  return (
    <Fragment>
      <div className="w-full h-full relative flex-1 z-0">
        <span className="absolute top-[-25px] left-[20px] text-primary-100 font-bold z-10">
          Memory
        </span>
        <ul className="w-full h-full overflow-y-scroll  text-xs font-mono absolute top-0 left-0 m-0 ">
          {snapShot?.machineCodeMemory.map((value, index) => (
            <li
              key={index}
              className={`flex justify-around ${
                index % 2 === 0 ? "bg-primary-800" : "bg-primary-700"
              } p-2`}
            >
              <span className="text-white">{toHex16(index)}</span>{" "}
              <span className="text-primary-300">{toHex16(value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
}

export { Memory };
