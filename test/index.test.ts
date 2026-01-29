import { test, expect, describe } from "bun:test";
import { DateTime } from "luxon";
import { CRMQuery, CRMQError, VALID_STATES } from "../src";
import { validateSearchOptions } from "../src/validation";
import { parseDoctor, parseResponse } from "../src/parser";
import type { RawDoctorData, RawAPIResponse } from "../src/types";

describe("validation", () => {
  test("validates valid state", () => {
    const result = validateSearchOptions({ state: "RS" });
    expect(result.state).toBe("RS");
  });

  test("converts state to uppercase", () => {
    const result = validateSearchOptions({ state: "rs" });
    expect(result.state).toBe("RS");
  });

  test("throws on invalid state", () => {
    expect(() => validateSearchOptions({ state: "XX" })).toThrow(CRMQError);
    try {
      validateSearchOptions({ state: "XX" });
    } catch (error) {
      expect((error as CRMQError).code).toBe("INVALID_STATE");
    }
  });

  test("throws on missing state", () => {
    expect(() => validateSearchOptions({ state: "" })).toThrow(CRMQError);
  });

  test("validates CRM as numeric string", () => {
    const result = validateSearchOptions({ state: "RS", crm: "43327" });
    expect(result.crm).toBe("43327");
  });

  test("throws on non-numeric CRM", () => {
    expect(() => validateSearchOptions({ state: "RS", crm: "ABC" })).toThrow(CRMQError);
    try {
      validateSearchOptions({ state: "RS", crm: "ABC" });
    } catch (error) {
      expect((error as CRMQError).code).toBe("INVALID_CRM");
    }
  });

  test("validates name as non-empty", () => {
    const result = validateSearchOptions({ state: "RS", name: "João" });
    expect(result.name).toBe("João");
  });
});

describe("parser", () => {
  const rawDoctor: RawDoctorData = {
    COUNT: "1",
    SG_UF: "RS",
    NU_CRM: "43327",
    NU_CRM_NATURAL: "43327",
    NM_MEDICO: "NAYHANY SANTOS ARAUJO",
    COD_SITUACAO: "A",
    NM_SOCIAL: null,
    DT_INSCRICAO: "03/03/2017",
    IN_TIPO_INSCRICAO: "P",
    TIPO_INSCRICAO: "Principal",
    SITUACAO: "Regular",
    ESPECIALIDADE: "&PSIQUIATRIA - RQE Nº: 36584",
    PRIM_INSCRICAO_UF: "03/03/2017",
    PERIODO_I: null,
    PERIODO_F: null,
    OBS_INTERDICAO: null,
    NM_INSTITUICAO_GRADUACAO: "UNIVERSIDADE DE CUIABA",
    DT_GRADUACAO: "2015",
    ID_TIPO_FORMACAO: "6",
    NM_FACULDADE_ESTRANGEIRA_GRADUACAO: null,
    HAS_POS_GRADUACAO: "0",
    RNUM: "1",
    SECURITYHASH: "6932e4653adf4df36894760917f1f62d",
  };

  test("parses doctor name", () => {
    const doctor = parseDoctor(rawDoctor);
    expect(doctor.name).toBe("NAYHANY SANTOS ARAUJO");
  });

  test("parses CRM and state", () => {
    const doctor = parseDoctor(rawDoctor);
    expect(doctor.crm).toBe("43327");
    expect(doctor.state).toBe("RS");
  });

  test("parses status code to readable status", () => {
    const doctor = parseDoctor(rawDoctor);
    expect(doctor.status).toBe("regular");
  });

  test("parses registration type", () => {
    const doctor = parseDoctor(rawDoctor);
    expect(doctor.registrationType).toBe("principal");
  });

  test("parses registration date to DateTime", () => {
    const doctor = parseDoctor(rawDoctor);
    expect(doctor.registrationDate).toBeInstanceOf(DateTime);
    expect(doctor.registrationDate.year).toBe(2017);
    expect(doctor.registrationDate.month).toBe(3);
    expect(doctor.registrationDate.day).toBe(3);
  });

  test("extracts and cleans specialty", () => {
    const doctor = parseDoctor(rawDoctor);
    expect(doctor.specialty).toBe("Psiquiatria");
  });

  test("extracts RQE number", () => {
    const doctor = parseDoctor(rawDoctor);
    expect(doctor.rqe).toBe("36584");
  });

  test("parses graduation info", () => {
    const doctor = parseDoctor(rawDoctor);
    expect(doctor.graduationInstitution).toBe("UNIVERSIDADE DE CUIABA");
    expect(doctor.graduationYear).toBe(2015);
  });

  test("handles null specialty", () => {
    const rawWithoutSpecialty = { ...rawDoctor, ESPECIALIDADE: null };
    const doctor = parseDoctor(rawWithoutSpecialty);
    expect(doctor.specialty).toBeNull();
    expect(doctor.rqe).toBeNull();
  });

  test("parses full API response", () => {
    const response: RawAPIResponse = {
      status: "sucesso",
      dados: [rawDoctor],
    };
    const result = parseResponse(response);
    expect(result.total).toBe(1);
    expect(result.doctors.length).toBe(1);
    expect(result.doctors[0]?.name).toBe("NAYHANY SANTOS ARAUJO");
  });

  test("handles empty response", () => {
    const response: RawAPIResponse = {
      status: "sucesso",
      dados: [],
    };
    const result = parseResponse(response);
    expect(result.total).toBe(0);
    expect(result.doctors.length).toBe(0);
  });
});

describe("CRMQuery builder", () => {
  test("chains methods correctly", () => {
    const query = new CRMQuery();
    const result = query.state("RS").crm("43327").name("Test");
    expect(result).toBe(query);
  });

  test("reset clears all fields", async () => {
    const query = new CRMQuery().state("RS").crm("43327").reset();
    // After reset, search should fail due to missing state
    await expect(query.search()).rejects.toThrow(CRMQError);
  });
});

describe("constants", () => {
  test("all 27 Brazilian states are defined", () => {
    expect(VALID_STATES.length).toBe(27);
    expect(VALID_STATES).toContain("RS");
    expect(VALID_STATES).toContain("SP");
    expect(VALID_STATES).toContain("DF");
  });
});
