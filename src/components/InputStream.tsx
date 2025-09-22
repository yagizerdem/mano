import { Fragment, useState } from "react";
import { useAppContext } from "../context/AppContext";

function InputStream() {
  const [text, setText] = useState("");
  const { inputStream, setInputStream } = useAppContext();

  const handleSend = () => {
    if (text.length > 0) {
      const code = text.charCodeAt(0);
      setInputStream((prev) => [...prev, code]);
      setText(""); // clear input box
    }
  };
  const handlePop = () => {
    if (inputStream!.length > 0) {
      setInputStream((prev) => prev.slice(1));
    }
  };

  const handleClear = () => {
    setInputStream([]);
  };

  return (
    <Fragment>
      <div className="w-full h-full bg-primary-800 rounded-sm border-2 border-solid border-black relative p-2">
        <span className="absolute top-[-20px] left-[20px] text-primary-100 font-bold">
          Input Stream
        </span>
        <div className="w-full h-full bg-primary-700 rounded-sm p-2 text-white flex flex-col">
          {/* input ve buton */}
          <div className="flex mb-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 p-1 text-black rounded border-solid border border-gray-300"
              placeholder="Type a character..."
              maxLength={1}
            />
            <button
              onMouseUp={handleSend}
              className="ml-2 bg-primary-600 px-3 py-1 rounded text-white"
            >
              Send
            </button>
            <button
              className="ml-2 bg-primary-600 px-3 py-1 rounded text-white"
              onMouseUp={handlePop}
            >
              Pop
            </button>
            <button
              className="ml-2 bg-primary-600 px-3 py-1 rounded text-white"
              onMouseUp={handleClear}
            >
              Clear
            </button>
          </div>

          {/* liste */}
          <ul className="space-y-1 overflow-y-auto flex-1 ">
            {inputStream!.map((val, idx) => (
              <li key={idx} className="font-mono text-sm">
                DEC: {val} | BIN: {val.toString(2).padStart(8, "0")} | HEX: 0x
                {val.toString(16).toUpperCase().padStart(2, "0")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Fragment>
  );
}

export { InputStream };
