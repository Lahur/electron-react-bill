import type { AppDispatch } from "./store";

let dispatchRef: AppDispatch | null = null;

export function setDispatch(dispatch: AppDispatch) {
  dispatchRef = dispatch;
}

export function getDispatch(): AppDispatch {
  if (!dispatchRef) {
    throw new Error("Store dispatch accessed before the store was initialized");
  }
  return dispatchRef;
}
