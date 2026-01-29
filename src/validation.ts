import Joi from "joi";
import { VALID_STATES } from "./constants";
import { CRMQError } from "./errors";
import type { SearchOptions } from "./types";

/**
 * Joi schema for search options
 */
const searchOptionsSchema = Joi.object({
  state: Joi.string()
    .uppercase()
    .valid(...VALID_STATES)
    .required()
    .messages({
      "any.required": "State (UF) is required",
      "any.only": "Invalid state: {#value}. Must be a valid Brazilian UF.",
    }),
  crm: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .messages({
      "string.pattern.base": "CRM must contain only numbers",
    }),
  name: Joi.string()
    .min(1)
    .optional()
    .messages({
      "string.min": "Name cannot be empty",
    }),
});

/**
 * Validate search options and throw CRMQError if invalid
 */
export function validateSearchOptions(options: SearchOptions): SearchOptions {
  const { error, value } = searchOptionsSchema.validate(options, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details[0]?.message ?? "Validation failed";
    let code: "INVALID_STATE" | "INVALID_CRM" | "INVALID_NAME" = "INVALID_STATE";

    if (message.includes("CRM")) {
      code = "INVALID_CRM";
    } else if (message.includes("Name")) {
      code = "INVALID_NAME";
    }

    throw new CRMQError(message, code);
  }

  return value;
}
