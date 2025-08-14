/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InvoiceLineItem = {
  /**
   * A human readable description of the item.
   */
  description: string;
  /**
   * The number of units for the given line item.
   */
  quantity: number;
  /**
   * The amount in the minimum transactable unit for the given currency (cents for USD).
   */
  amount: number;
  /**
   * The currency of amount.
   */
  currency: string;
  /**
   * The name of the product for this item.
   */
  product?: string;
  /**
   * The name of the addon for this item if this is an addon.
   */
  addon?: string;
  /**
   * Whether this item was generated to prorate changes to the subscription within the subscription period.
   */
  proration?: boolean;
};
