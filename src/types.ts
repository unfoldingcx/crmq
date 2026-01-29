import type { DateTime } from "luxon";

/**
 * Search options for querying doctors
 */
export interface SearchOptions {
  /** Brazilian state code (UF) - required */
  state: string;
  /** CRM registration number - optional */
  crm?: string;
  /** Doctor's name (partial match) - optional */
  name?: string;
}

/**
 * Doctor status types
 */
export type DoctorStatus = "regular" | "irregular" | "suspended" | "canceled";

/**
 * Registration type
 */
export type RegistrationType = "principal" | "secondary" | "temporary";

/**
 * Normalized doctor information
 */
export interface Doctor {
  /** Full name */
  name: string;
  /** Social/preferred name if set */
  socialName: string | null;
  /** CRM registration number */
  crm: string;
  /** State of registration (UF) */
  state: string;
  /** Registration status */
  status: DoctorStatus;
  /** Type of registration */
  registrationType: RegistrationType;
  /** Date of registration */
  registrationDate: DateTime;
  /** Medical specialty (cleaned) */
  specialty: string | null;
  /** RQE number (specialty registration) */
  rqe: string | null;
  /** Graduation institution */
  graduationInstitution: string | null;
  /** Year of graduation */
  graduationYear: number | null;
}

/**
 * Search result from the API
 */
export interface SearchResult {
  /** List of doctors found */
  doctors: Doctor[];
  /** Total count of results */
  total: number;
}

/**
 * Raw API response structure
 */
export interface RawAPIResponse {
  status: string;
  dados: RawDoctorData[];
}

/**
 * Raw doctor data from API
 */
export interface RawDoctorData {
  COUNT: string;
  SG_UF: string;
  NU_CRM: string;
  NU_CRM_NATURAL: string;
  NM_MEDICO: string;
  COD_SITUACAO: string;
  NM_SOCIAL: string | null;
  DT_INSCRICAO: string;
  IN_TIPO_INSCRICAO: string;
  TIPO_INSCRICAO: string;
  SITUACAO: string;
  ESPECIALIDADE: string | null;
  PRIM_INSCRICAO_UF: string;
  PERIODO_I: string | null;
  PERIODO_F: string | null;
  OBS_INTERDICAO: string | null;
  NM_INSTITUICAO_GRADUACAO: string | null;
  DT_GRADUACAO: string | null;
  ID_TIPO_FORMACAO: string;
  NM_FACULDADE_ESTRANGEIRA_GRADUACAO: string | null;
  HAS_POS_GRADUACAO: string;
  RNUM: string;
  SECURITYHASH: string;
}
