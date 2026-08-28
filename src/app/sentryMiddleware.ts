import { isRejected, type Middleware } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/electron/renderer";

/**
 * Reports rejected async-thunk actions to Sentry. Async thunks catch their
 * errors internally and only surface them as a `rejected` action, so without
 * this they would never reach Sentry's global handlers.
 *
 * Axios failures are already captured (with full HTTP context) by the response
 * interceptor in httpClient.ts, so they are skipped here to avoid duplicates.
 */
export const sentryMiddleware: Middleware = () => (next) => (action) => {
  if (isRejected(action) && !action.meta.aborted && action.error?.name !== "AxiosError") {
    const error = action.error;
    Sentry.captureException(error?.stack ? error : new Error(error?.message ?? String(action.type)), {
      mechanism: { type: "redux", handled: true },
      captureContext: {
        tags: { source: "thunk" },
        extra: { actionType: action.type, error },
      },
    });
  }
  return next(action);
};
