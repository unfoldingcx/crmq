import type { DoctorStatus, RegistrationType } from "./types";

/**
 * Valid Brazilian state codes (UF)
 */
export const VALID_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export type BrazilianState = (typeof VALID_STATES)[number];

/**
 * Map API status codes to normalized status
 */
export const STATUS_MAP: Record<string, DoctorStatus> = {
  A: "regular",
  I: "irregular",
  S: "suspended",
  C: "canceled",
};

/**
 * Map API registration type codes to normalized type
 */
export const REGISTRATION_TYPE_MAP: Record<string, RegistrationType> = {
  P: "principal",
  S: "secondary",
  T: "temporary",
};

/**
 * CFM API endpoint
 */
export const API_URL = "https://portal.cfm.org.br/api_rest_php/api/v2/medicos/buscar_medicos";

/**
 * Required headers for API requests
 */
export const API_HEADERS = {
  Accept: "application/json, text/javascript, */*; q=0.01",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  Origin: "https://portal.cfm.org.br",
  Referer: "https://portal.cfm.org.br/busca-medicos",
  "X-Requested-With": "XMLHttpRequest",
};

/**
 * Regex to extract RQE number from specialty string
 * Example: "&PSIQUIATRIA - RQE Nº: 36584" -> captures "36584"
 */
export const RQE_REGEX = /RQE\s*N[º°]?:?\s*(\d+)/i;

/**
 * Regex to clean specialty name
 * Removes leading & and RQE suffix
 */
export const SPECIALTY_CLEAN_REGEX = /^&?(.+?)(?:\s*-\s*RQE.*)?$/i;
