/**
 * CRMQ - Query Brazilian doctors through the CFM portal API
 */

// Main exports
export { CRMQuery, search } from "./query";

// Error handling
export { CRMQError } from "./errors";
export type { CRMQErrorCode } from "./errors";

// Types
export type {
  SearchOptions,
  SearchResult,
  Doctor,
  DoctorStatus,
  RegistrationType,
} from "./types";

// Constants
export { VALID_STATES } from "./constants";
export type { BrazilianState } from "./constants";

// Default instance for convenience
import { CRMQuery } from "./query";

/**
 * Default query builder instance
 *
 * @example
 * ```typescript
 * const result = await crmq
 *   .state("RS")
 *   .crm("43327")
 *   .search();
 * ```
 */
export const crmq = new CRMQuery();

// Default export
export default crmq;
