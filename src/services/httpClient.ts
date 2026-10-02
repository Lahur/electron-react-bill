import axios from "axios";
import * as Sentry from "@sentry/electron/renderer";
import {getDispatch} from "../app/storeAccessor";
import {getAccessTokenSilently} from "../app/authAccessor";
import {requestFinished, requestStarted} from "../features/ui/uiSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// Keycloak user-attribute mapper puts the tenant into the access token under
// this claim; the backend expects it echoed back as X-Tenant-Id.
const TENANT_CLAIM = "tenant-id";

function getTenantId(token: string): string | undefined {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes));
    const tenantId = claims[TENANT_CLAIM];
    return tenantId != null ? String(tenantId) : undefined;
  } catch {
    return undefined;
  }
}

export function createApiClient(basePath: string) {
  const client = axios.create({
    baseURL: `${API_BASE_URL}${basePath}`,
  });

  client.interceptors.request.use(async (config) => {
    getDispatch()(requestStarted());
    const token = await getAccessTokenSilently();
    config.headers.set("Authorization", `Bearer ${token}`);
    const tenantId = getTenantId(token);
    if (tenantId) {
      config.headers.set("X-Tenant-Id", tenantId);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      getDispatch()(requestFinished());
      return response;
    },
    (error) => {
      getDispatch()(requestFinished());
      // Every real API failure funnels through here, including the ones that
      // component/thunk catch blocks swallow into local error state, so this
      // is where handled HTTP errors are forwarded to Sentry. Non-HTTP failures
      // (e.g. token retrieval throwing in the request interceptor) are left for
      // the Redux middleware so they are only reported once.
      if (axios.isAxiosError(error) && !axios.isCancel(error)) {
        const { config, response } = error;
        Sentry.captureException(error, {
          mechanism: { type: "http.client", handled: true },
          captureContext: {
            tags: { source: "api", status: response?.status },
            extra: {
              method: config?.method?.toUpperCase(),
              url: config ? `${config.baseURL ?? ""}${config.url ?? ""}` : undefined,
              status: response?.status,
              responseData: response?.data,
            },
          },
        });
      }
      return Promise.reject(error);
    },
  );

  return client;
}