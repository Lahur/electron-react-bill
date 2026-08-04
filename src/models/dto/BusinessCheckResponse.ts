import type { AmsCheckResponse } from "./AmsCheckResponse";
import type { BusinessEntity } from "./BusinessEntity";

export interface BusinessCheckResponse {
  amsCheckResponse: AmsCheckResponse;
  businessEntity?: BusinessEntity;
}