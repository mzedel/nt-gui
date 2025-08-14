/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceLineItem } from "./InvoiceLineItem";
export type Invoice = {
  id?: string;
  period_start?: string;
  period_end?: string;
  /**
   * Total amount in the minimum transactable unit for the given currency (cents for USD).
   */
  total?: number;
  /**
   * The currency of the amount
   */
  currency?: string;
  lines?: Array<InvoiceLineItem>;
};
