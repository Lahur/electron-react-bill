export {};

declare global {
  interface Window {
    electron: {
      platform: string;
      openBankStatementFiles: () => Promise<{ name: string; data: Uint8Array<ArrayBuffer> }[]>;
      openOrderDocument: () => Promise<{ name: string; data: Uint8Array<ArrayBuffer> } | null>;
    };
  }
}