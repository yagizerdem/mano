import { Fragment } from "react/jsx-runtime";
import { useLogger } from "../hooks/useLogger";
import { logger } from "../simulator/Logger";

function Logger() {
  const logs = useLogger();

  const levelColors: Record<string, string> = {
    INFO: "text-blue-400 border-blue-400",
    WARNING: "text-yellow-400 border-yellow-400",
    ERROR: "text-red-400 border-red-400",
    SUCCESS: "text-green-400 border-green-400",
  };

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg shadow-md flex flex-col">
      <button
        className="text-gray-400 bg-primary-800 w-[100px] rounded-sm cursor-pointer hover:text-gray-200"
        onClick={() => logger.clearLogs()}
      >
        Clear Logs
      </button>
      <div className="p-2 border-b border-gray-700 text-sm text-gray-300 font-bold">
        Logs
      </div>
      <ul className="flex flex-col overflow-y-auto p-2 gap-1 flex-1">
        {logs.map((log, index) => (
          <li
            key={index}
            className={`text-xs px-2 py-1 rounded-md border-l-4 bg-gray-800 ${
              levelColors[log.level]
            }`}
          >
            <div className="flex justify-between">
              <span className="font-mono text-gray-400">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="uppercase text-gray-500">{log.context}</span>
            </div>
            <div className="mt-1">{log.message}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { Logger };
