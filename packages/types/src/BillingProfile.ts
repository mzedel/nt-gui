/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Address } from "./Address";
/**
 * Billing profile contains information about the customer.
 */
export type BillingProfile = {
  /**
   * The customer's email address.
   */
  email: string;
  /**
   * The customer's full name or business name.
   */
  name: string;
  /**
   * The customer's phone number.
   */
  phone?: string;
  address: Address;
  /**
   * Mailing and shipping address for the customer. Appears on invoices.
   */
  shipping: {
    /**
     * Name of the recipient.
     */
    name?: string;
    /**
     * Phone number of the recipient (including extension).
     */
    phone?: string;
    address?: Address;
  };
};
