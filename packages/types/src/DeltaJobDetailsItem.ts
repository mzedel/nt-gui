/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DeltaJobDetailsItem = {
  /**
   * Identifier of a deployment
   */
  deployment_id?: string;
  /**
   * Array of the devices types names compatible with this artifact
   */
  devices_types_compatible?: Array<string>;
  /**
   * Target release name
   */
  to_release?: string;
  /**
   * Source release name
   */
  from_release?: string;
  /**
   * Gneration status
   */
  status?: DeltaJobDetailsItem.status;
  /**
   * Details of the delta generation job
   */
  log?: string;
  /**
   * Exit code of the delta generation job
   */
  exit_code?: number;
  /**
   * Size of the target artifact
   */
  to_artifact_size?: number;
  /**
   * Size of the resulting delta artifact
   */
  delta_artifact_size?: number;
};
export namespace DeltaJobDetailsItem {
  /**
   * Gneration status
   */
  export enum status {
    PENDING = "pending",
    QUEUED = "queued",
    SUCCESS = "success",
    FAILED = "failed",
    ARTIFACT_UPLOADED = "artifact_uploaded",
  }
}
