# crmq

Query Brazilian doctors through the CFM (Conselho Federal de Medicina) portal API.

## Installation

```bash
bun install
```

## Library Usage

### Builder Pattern

```typescript
import crmq from "crmq";

const result = await crmq
  .state("RS")      // Required - Brazilian state (UF)
  .crm("43327")     // Optional - CRM number
  .name("João")     // Optional - Doctor name
  .search();

console.log(result.doctors);
```

### Direct Function

```typescript
import { search } from "crmq";

const result = await search({
  state: "RS",
  crm: "43327",
});
```

### Response Type

```typescript
interface Doctor {
  name: string;
  socialName: string | null;
  crm: string;
  state: string;
  status: "regular" | "irregular" | "suspended" | "canceled";
  registrationType: "principal" | "secondary" | "temporary";
  registrationDate: DateTime;  // Luxon DateTime
  specialty: string | null;
  rqe: string | null;          // Specialty registration number
  graduationInstitution: string | null;
  graduationYear: number | null;
}
```

### Error Handling

```typescript
import { search, CRMQError } from "crmq";

try {
  const result = await search({ state: "XX" });
} catch (error) {
  if (error instanceof CRMQError) {
    console.log(error.code);    // "INVALID_STATE"
    console.log(error.message); // "Invalid state: XX..."
  }
}
```

## CLI Usage

```bash
# Search by CRM number
crmq -s RS -c 43327

# Search by name
crmq --state SP --name "João Silva"

# JSON output
crmq -s RS -c 43327 --json

# Pipe to jq
crmq -s RS -c 43327 --json | jq '.doctors[0].specialty'
```

### CLI Options

| Flag | Description |
|------|-------------|
| `-s, --state <UF>` | Brazilian state code (required) |
| `-c, --crm <number>` | CRM registration number |
| `-n, --name <name>` | Doctor's name (partial match) |
| `--json` | Output as JSON |
| `-h, --help` | Show help |

## Development

```bash
# Run tests
bun test

# Run CLI locally
bun bin/cli.ts -s RS -c 43327
```
