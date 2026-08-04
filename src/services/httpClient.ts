import axios from "axios";
import { getDispatch } from "../app/storeAccessor";
import { getAccessTokenSilently } from "../app/authAccessor";
import { requestStarted, requestFinished } from "../features/ui/uiSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export function createApiClient(basePath: string) {
  const client = axios.create({
    baseURL: `${API_BASE_URL}${basePath}`,
  });

  client.interceptors.request.use(async (config) => {
    getDispatch()(requestStarted());
    const token = await getAccessTokenSilently();
    config.headers.set("Authorization", `Bearer ${token}`);
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      getDispatch()(requestFinished());
      return response;
    },
    (error) => {
      getDispatch()(requestFinished());
      return Promise.reject(error);
    },
  );

  return client;
}