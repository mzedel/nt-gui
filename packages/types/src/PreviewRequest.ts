/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionRequest } from "./SubscriptionRequest";
export type PreviewRequest = SubscriptionRequest & {
  preview_mode?: PreviewRequest.preview_mode;
};
export namespace PreviewRequest {
  export enum preview_mode {
    NEXT = "next",
    RECURRING = "recurring",
  }
}
