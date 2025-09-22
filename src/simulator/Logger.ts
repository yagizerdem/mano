type LogLevel = "INFO" | "WARNING" | "ERROR" | "SUCCESS";

type LogContext =
  | "FETCH"
  | "DECODE"
  | "EXECUTE_MRI"
  | "EXECUTE_NMRI"
  | "EXECUTE_IO"
  | "DIRECTIVE"
  | "SYSTEM"
  | "LEXER"
  | "PARSER"
  | "ASSEMBLER";

interface LogEntry {
  timestamp: string;
  context: LogContext;
  level: LogLevel;
  message: string;
}

type Listener = (logs: LogEntry[]) => void;

class Logger {
  private logs: LogEntry[] = [];
  private listeners: Listener[] = [];

  private log(context: LogContext, level: LogLevel, message: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      context,
      level,
      message,
    };
    this.logs.push(entry);
    this.notify();
  }

  public info(context: LogContext, message: string) {
    this.log(context, "INFO", message);
  }

  public warn(context: LogContext, message: string) {
    this.log(context, "WARNING", message);
  }

  public success(context: LogContext, message: string) {
    this.log(context, "SUCCESS", message);
  }

  public error(context: LogContext, message: string) {
    this.log(context, "ERROR", message);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((l) => l.level === level);
  }

  public getLogsByContext(context: LogContext): LogEntry[] {
    return this.logs.filter((l) => l.context === context);
  }

  public clearLogs(): void {
    this.logs = [];
    this.notify();
  }

  // observer pattern
  private notify() {
    for (const l of this.listeners) {
      l([...this.logs]);
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.push(listener);
    // immediately send current logs
    listener([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

const logger = new Logger();

export { logger, type LogEntry };
