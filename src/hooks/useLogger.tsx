import { useEffect, useState } from "react";
import { logger, type LogEntry } from "../simulator/Logger";

export function useLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const unsubscribe = logger.subscribe(setLogs);
    return unsubscribe;
  }, []);

  return logs;
}
