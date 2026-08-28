export {};

declare global {
  interface Window {
    electron: {
      platform: string;
      openBankStatementFiles: () => Promise<{ name: string; data: Uint8Array<ArrayBuffer> }[]>;
      openOrderDocument: () => Promise<{ name: string; data: Uint8Array<ArrayBuffer> } | null>;
      openPosTransactionBill: () => Promise<{ name: string; data: Uint8Array<ArrayBuffer> } | null>;
      openAccountsStatementBill: () => Promise<{ name: string; data: Uint8Array<ArrayBuffer> } | null>;
      auth: {
        login: () => Promise<{ name?: string; email?: string; picture?: string }>;
        logout: () => Promise<void>;
        getToken: () => Promise<string>;
        onSessionExpired: (callback: () => void) => () => void;
      };
    };
  }
}