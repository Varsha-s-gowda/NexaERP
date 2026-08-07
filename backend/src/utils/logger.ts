type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

class Logger {
  private log(level: LogLevel, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  info(message: string): void {
    this.log("INFO", message);
  }

  warn(message: string): void {
    this.log("WARN", message);
  }

  error(message: string): void {
    this.log("ERROR", message);
  }

  debug(message: string): void {
    this.log("DEBUG", message);
  }
}

export const logger = new Logger();