import axios, { AxiosError } from "axios";
import { API_URL, API_HEADERS } from "./constants";
import { CRMQError } from "./errors";
import { parseResponse } from "./parser";
import type { SearchOptions, SearchResult, RawAPIResponse } from "./types";

/**
 * Build the request payload for the CFM API
 */
function buildPayload(options: SearchOptions): string {
  const payload = [
    {
      medico: {
        nome: options.name ?? "",
        ufMedico: options.state,
        crmMedico: options.crm ?? "",
        municipioMedico: "",
        tipoInscricaoMedico: "",
        situacaoMedico: "",
        detalheSituacaoMedico: "",
        especialidadeMedico: "",
        areaAtuacaoMedico: "",
      },
      page: 1,
      pageNumber: 1,
      pageSize: 100,
    },
  ];

  return JSON.stringify(payload);
}

/**
 * Execute search request to CFM API
 */
export async function executeSearch(options: SearchOptions): Promise<SearchResult> {
  try {
    const response = await axios.post<RawAPIResponse>(API_URL, buildPayload(options), {
      headers: API_HEADERS,
    });

    if (response.data.status !== "sucesso") {
      throw new CRMQError(
        `API returned error status: ${response.data.status}`,
        "API_ERROR"
      );
    }

    return parseResponse(response.data);
  } catch (error) {
    if (error instanceof CRMQError) {
      throw error;
    }

    if (error instanceof AxiosError) {
      throw new CRMQError(
        `Network error: ${error.message}`,
        "NETWORK_ERROR",
        error
      );
    }

    throw new CRMQError(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      "API_ERROR",
      error
    );
  }
}
