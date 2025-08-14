/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Addon } from "./Addon";
export type Product = {
  name?: Product.name;
  quantity: number;
  addons?: Array<Addon>;
};
export namespace Product {
  export enum name {
    MENDER_STANDARD = "mender_standard",
  }
}
