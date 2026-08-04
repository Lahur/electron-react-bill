export function getAccessTokenSilently(): Promise<string> {
  return window.electron.auth.getToken();
}