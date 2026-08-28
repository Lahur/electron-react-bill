import type {BusinessType} from "./BusinessType";

export interface BusinessEntity {
  name: string;
  shortName: string;
  oib: string;
  mbs: string;
  emailAddress: string;
  headquatersAddress: string;
  headquatersCity: string;
  headquatersZip: string;
  headquatersRegion: string;
  foundingCapitalAmount: number;
  foundingCapitalCurrency: string;
  legalForm: string;
  legalFormShort: string;
  sudregRawData: string;
  companyFounders: unknown[];
  legalRepresentatives: unknown[];
  businessTypes: BusinessType[];
  registrationCourtName: string;
  competentCourtName: string;
}