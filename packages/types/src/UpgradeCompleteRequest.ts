/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BillingProfile } from "./BillingProfile";
import type { Plan } from "./Plan";
/**
 * Upgrade a trial tenant to a given plan.
 */
export type UpgradeCompleteRequest = {
  plan: Plan;
  billing_profile?: BillingProfile;
};
