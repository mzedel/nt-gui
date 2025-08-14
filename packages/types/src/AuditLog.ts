/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Actor } from "./Actor";
import type { AuditLogObject } from "./AuditLogObject";
/**
 * Audit log entry
 */
export type AuditLog = {
  actor: Actor;
  time: string;
  action: AuditLog.action;
  object: AuditLogObject;
  change?: string;
};
export namespace AuditLog {
  export enum action {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    ABORT = "abort",
    REJECT = "reject",
    DECOMMISSION = "decommission",
    OPEN_TERMINAL = "open_terminal",
    CLOSE_TERMINAL = "close_terminal",
    OPEN_PORTFORWARD = "open_portforward",
    CLOSE_PORTFORWARD = "close_portforward",
    DOWNLOAD_FILE = "download_file",
    UPLOAD_FILE = "upload_file",
    SET_CONFIGURATION = "set_configuration",
    DEPLOY_CONFIGURATION = "deploy_configuration",
    UPLOAD = "upload",
  }
}
