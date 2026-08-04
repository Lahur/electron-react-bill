type GetAccessTokenSilently = () => Promise<string>;

let getAccessTokenSilentlyRef: GetAccessTokenSilently | null = null;

export function setGetAccessTokenSilently(fn: GetAccessTokenSilently) {
  getAccessTokenSilentlyRef = fn;
}

export function getAccessTokenSilently(): Promise<string> {
  if (!getAccessTokenSilentlyRef) {
    throw new Error("Auth0 token getter accessed before Auth0 was initialized");
  }
  return getAccessTokenSilentlyRef();
}