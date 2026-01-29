/**
 * Error codes for CRMQ library
 */
export type CRMQErrorCode =
  | "INVALID_STATE"
  | "INVALID_CRM"
  | "INVALID_NAME"
  | "NETWORK_ERROR"
  | "API_ERROR";

/**
 * Custom error class for CRMQ library
 */
export class CRMQError extends Error {
  public code: CRMQErrorCode;

  constructor(message: string, code: CRMQErrorCode, cause?: unknown) {
    super(message, { cause });
    this.name = "CRMQError";
    this.code = code;
  }
}
