# CRMQ Library Design

A TypeScript library for querying Brazilian doctors through the CFM (Conselho Federal de Medicina) portal API.

## Overview

CRMQ provides a typed, developer-friendly interface to search for doctors registered with Brazilian Regional Medical Councils. It includes both a programmatic API and a CLI tool.

## API Surface

### Builder Pattern

```typescript
const results = await crmq
  .state("RS")           // Required - Brazilian state (UF)
  .crm("43327")          // Optional - CRM number
  .name("Nayhany")       // Optional - Doctor's name (partial match)
  .search();
```

### Direct Function Call

```typescript
const results = await crmq.search({
  state: "RS",
  crm: "43327",
});
```

### Exports

- `crmq` - Default instance with builder pattern
- `search(options)` - Direct function for one-off queries
- `CRMQuery` - Class for creating custom instances
- Types: `SearchOptions`, `Doctor`, `SearchResult`

### Validation Rules

- State is required and must be valid Brazilian UF (2 letters)
- CRM number validated as numeric string
- Name validated as non-empty string if provided

## Response Types

```typescript
interface Doctor {
  // Identity
  name: string;              // "NAYHANY SANTOS ARAUJO"
  socialName: string | null; // Preferred name if set
  crm: string;               // "43327"
  state: string;             // "RS"

  // Status
  status: "regular" | "irregular" | "suspended" | "canceled";
  registrationType: "principal" | "secondary" | "temporary";
  registrationDate: DateTime;  // Luxon DateTime

  // Professional
  specialty: string | null;    // "Psiquiatria" (cleaned)
  rqe: string | null;          // "36584" (specialty registration number)

  // Education
  graduationInstitution: string | null;
  graduationYear: number | null;
}

interface SearchResult {
  doctors: Doctor[];
  total: number;
}
```

### Normalization

| Raw API Value | Normalized |
|---------------|------------|
| `COD_SITUACAO: "A"` | `status: "regular"` |
| `IN_TIPO_INSCRICAO: "P"` | `registrationType: "principal"` |
| `"&PSIQUIATRIA - RQE Nº: 36584"` | `specialty: "Psiquiatria"`, `rqe: "36584"` |
| `"03/03/2017"` | Luxon `DateTime` object |
| `"2015"` | `graduationYear: 2015` (number) |

## Error Handling

```typescript
class CRMQError extends Error {
  constructor(
    message: string,
    public code: CRMQErrorCode,
    public cause?: unknown
  ) {
    super(message);
    this.name = "CRMQError";
  }
}

type CRMQErrorCode =
  | "INVALID_STATE"      // State not provided or invalid UF
  | "INVALID_CRM"        // CRM format invalid
  | "INVALID_NAME"       // Empty name string
  | "NETWORK_ERROR"      // Connection failed, timeout, etc.
  | "API_ERROR";         // API returned error status
```

## CLI Interface

### Usage

```bash
# Basic usage (state required)
crmq --state RS --crm 43327
crmq -s RS -c 43327

# Search by name
crmq --state SP --name "João Silva"
crmq -s SP -n "João Silva"

# JSON output for piping
crmq -s RS -c 43327 --json
crmq -s RS -c 43327 --json | jq '.doctors[0].specialty'
```

### Flags

- `-s, --state` (required) - Brazilian state UF
- `-c, --crm` - CRM number
- `-n, --name` - Doctor name
- `--json` - Output as JSON instead of table

### Table Output (default)

```
┌─────────────────────────┬────────┬───────┬──────────┬─────────────┐
│ Name                    │ CRM    │ State │ Status   │ Specialty   │
├─────────────────────────┼────────┼───────┼──────────┼─────────────┤
│ NAYHANY SANTOS ARAUJO   │ 43327  │ RS    │ Regular  │ Psiquiatria │
└─────────────────────────┴────────┴───────┴──────────┴─────────────┘
Found 1 doctor(s)
```

## File Structure

```
crmq/
├── src/
│   ├── index.ts           # Main exports (crmq, search, CRMQuery, types)
│   ├── client.ts          # Axios client with headers, POST logic
│   ├── query.ts           # CRMQuery class (builder pattern)
│   ├── parser.ts          # Normalize API response → Doctor
│   ├── errors.ts          # CRMQError class and error codes
│   ├── validation.ts      # Joi schemas, validate state/crm/name
│   ├── constants.ts       # Valid UF codes, status maps, regex patterns
│   └── types.ts           # TypeScript interfaces
├── bin/
│   └── cli.ts             # CLI entry point (parses args, calls library)
├── test/
│   └── index.test.ts      # Tests using bun test
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencies

**Used:**
- `axios` - HTTP requests to CFM API
- `luxon` - DateTime parsing for Brazilian date formats
- `joi` - Input validation
- `chalk` - CLI colored output

**To Remove:**
- `express`, `helmet` - Not needed (library, not server)
- `winston` - No logging
- `lodash`, `ms`, `util` - Not needed
