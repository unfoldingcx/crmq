import { DateTime } from "luxon";
import {
  STATUS_MAP,
  REGISTRATION_TYPE_MAP,
  RQE_REGEX,
  SPECIALTY_CLEAN_REGEX,
} from "./constants";
import type {
  Doctor,
  DoctorStatus,
  RawDoctorData,
  RegistrationType,
  SearchResult,
  RawAPIResponse,
} from "./types";

/**
 * Parse Brazilian date format (DD/MM/YYYY) to Luxon DateTime
 */
function parseDate(dateStr: string): DateTime {
  return DateTime.fromFormat(dateStr, "dd/MM/yyyy");
}

/**
 * Parse graduation year string to number
 */
function parseGraduationYear(yearStr: string | null): number | null {
  if (!yearStr) return null;
  const year = parseInt(yearStr, 10);
  return isNaN(year) ? null : year;
}

/**
 * Parse status code to normalized status
 */
function parseStatus(code: string): DoctorStatus {
  return STATUS_MAP[code] ?? "irregular";
}

/**
 * Parse registration type code to normalized type
 */
function parseRegistrationType(code: string): RegistrationType {
  return REGISTRATION_TYPE_MAP[code] ?? "principal";
}

/**
 * Extract RQE number from specialty string
 */
function extractRQE(specialty: string | null): string | null {
  if (!specialty) return null;
  const match = specialty.match(RQE_REGEX);
  return match?.[1] ?? null;
}

/**
 * Clean specialty name (remove leading &, RQE suffix, and normalize case)
 */
function cleanSpecialty(specialty: string | null): string | null {
  if (!specialty) return null;
  const match = specialty.match(SPECIALTY_CLEAN_REGEX);
  if (!match?.[1]) return null;

  // Normalize: trim, title case
  const cleaned = match[1].trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

/**
 * Parse raw API doctor data to normalized Doctor
 */
export function parseDoctor(raw: RawDoctorData): Doctor {
  return {
    name: raw.NM_MEDICO,
    socialName: raw.NM_SOCIAL,
    crm: raw.NU_CRM,
    state: raw.SG_UF,
    status: parseStatus(raw.COD_SITUACAO),
    registrationType: parseRegistrationType(raw.IN_TIPO_INSCRICAO),
    registrationDate: parseDate(raw.DT_INSCRICAO),
    specialty: cleanSpecialty(raw.ESPECIALIDADE),
    rqe: extractRQE(raw.ESPECIALIDADE),
    graduationInstitution: raw.NM_INSTITUICAO_GRADUACAO,
    graduationYear: parseGraduationYear(raw.DT_GRADUACAO),
  };
}

/**
 * Parse raw API response to SearchResult
 */
export function parseResponse(response: RawAPIResponse): SearchResult {
  const doctors = response.dados.map(parseDoctor);
  const firstRecord = response.dados[0];
  const total = firstRecord ? parseInt(firstRecord.COUNT, 10) : 0;

  return {
    doctors,
    total: isNaN(total) ? doctors.length : total,
  };
}
