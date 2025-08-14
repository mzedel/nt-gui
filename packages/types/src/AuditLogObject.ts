/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Artifact } from "./Artifact";
import type { Deployment } from "./Deployment";
import type { Device } from "./Device";
import type { Tenant } from "./Tenant";
import type { User } from "./User";
/**
 * Various types of objects are supported.
 * Depending on the type of object different information will be available.
 */
export type AuditLogObject = {
  /**
   * A unique identifier of the object.
   */
  id: string;
  /**
   * The type of the object.
   */
  type: AuditLogObject.type;
  tenant?: Tenant;
  user?: User;
  deployment?: Deployment;
  artifact?: Artifact;
  device?: Device;
};
export namespace AuditLogObject {
  /**
   * The type of the object.
   */
  export enum type {
    TENANT = "tenant",
    USER = "user",
    DEPLOYMENT = "deployment",
    ARTIFACT = "artifact",
    DEVICE = "device",
  }
}
