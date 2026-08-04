export const DocumentStatus = {
  NaCekanju: "NaCekanju",
  NaSlanju: "NaSlanju",
  Poslan: "Poslan",
  Isporucen: "Isporucen",
  Odobren: "Odobren",
  Odbijen: "Odbijen",
  PlacenUPotpunosti: "PlacenUPotpunosti",
  ParcijalnoPlacen: "ParcijalnoPlacen",
  NeuspjesnaIsporuka: "NeuspjesnaIsporuka",
} as const;

export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const documentStatusLabels: Record<DocumentStatus, string> = {
  [DocumentStatus.NaCekanju]: "Na čekanju",
  [DocumentStatus.NaSlanju]: "Na slanju",
  [DocumentStatus.Poslan]: "Poslan",
  [DocumentStatus.Isporucen]: "Isporučen",
  [DocumentStatus.Odobren]: "Odobren",
  [DocumentStatus.Odbijen]: "Odbijen",
  [DocumentStatus.PlacenUPotpunosti]: "Plaćen u potpunosti",
  [DocumentStatus.ParcijalnoPlacen]: "Parcijalno plaćen",
  [DocumentStatus.NeuspjesnaIsporuka]: "Neuspješna isporuka",
};
