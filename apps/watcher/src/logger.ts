type Context = Record<string, unknown> | undefined;

function log(level: "info" | "warn" | "error", message: string, context?: Context) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ?? {}),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  console.log(line);
}

export const logger = {
  info(message: string, context?: Context) {
    log("info", message, context);
  },
  warn(message: string, context?: Context) {
    log("warn", message, context);
  },
  error(message: string, context?: Context) {
    log("error", message, context);
  },
};
