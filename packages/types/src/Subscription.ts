/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionRequest } from "./SubscriptionRequest";
export type Subscription = SubscriptionRequest & {
  /**
   * The unique subscription ID.
   */
  id?: string;
  /**
   * The subscription status.
   */
  status?: Subscription.status;
};
export namespace Subscription {
  /**
   * The subscription status.
   */
  export enum status {
    ACTIVE = "active",
    CANCELED = "canceled",
    INCOMPLETE = "incomplete",
    PAST_DUE = "past_due",
    UNPAID = "unpaid",
  }
}
