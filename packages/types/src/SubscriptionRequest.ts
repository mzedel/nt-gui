/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Plan } from "./Plan";
import type { Product } from "./Product";
export type SubscriptionRequest = {
  plan?: Plan;
  /**
   * The requested product and additional properties like quantity and addons
   */
  products?: Array<Product>;
};
