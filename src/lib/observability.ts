type ErrorContext = {
  scope?: string;
  action?: string;
  metadata?: Record<string, unknown>;
};

function toErrorPayload(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : JSON.stringify(error),
    stack: undefined,
  };
}

export function reportError(error: unknown, context: ErrorContext = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    ...context,
    ...toErrorPayload(error),
  };

  console.error("[client-error]", payload);

  const endpoint = import.meta.env.VITE_CLIENT_ERROR_ENDPOINT as string | undefined;
  if (!endpoint || typeof window === "undefined") return;

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, body);
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function installGlobalErrorHandlers() {
  if (typeof window === "undefined") return;

  const onError = (event: ErrorEvent) => {
    reportError(event.error ?? event.message, {
      scope: "global",
      action: "window.error",
    });
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    reportError(event.reason, {
      scope: "global",
      action: "unhandledrejection",
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}
