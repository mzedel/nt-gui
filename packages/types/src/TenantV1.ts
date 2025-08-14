/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Addon } from "./Addon";
import type { Plan } from "./Plan";
import type { TenantAdditionalInfo } from "./TenantAdditionalInfo";
import type { TenantApiLimits } from "./TenantApiLimits";
/**
 * Tenant descriptor.
 */
export type TenantV1 = {
  /**
   * Tenant ID.
   */
  id: string;
  /**
   * Name of the tenant's organization.
   */
  name: string;
  /**
   * Currently used tenant token.
   */
  tenant_token: string;
  /**
   * Status of the tenant account.
   */
  status?: TenantV1.status;
  plan?: Plan;
  /**
   * Whether this account is free trial.
   */
  trial?: boolean;
  /**
   * When trial evaluation expires.
   */
  trial_expiration?: string;
  /**
   * Addons configuration.
   */
  addons?: Array<Addon>;
  /**
   * Whether this account is a service provider.
   */
  service_provider?: boolean;
  additional_info?: TenantAdditionalInfo;
  api_limits?: TenantApiLimits;
  /**
   * Creation date and time, in ISO8601 format.
   */
  created_at?: string;
};
export namespace TenantV1 {
  /**
   * Status of the tenant account.
   */
  export enum status {
    ACTIVE = "active",
    SUSPENDED = "suspended",
  }
}
