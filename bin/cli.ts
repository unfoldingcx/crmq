#!/usr/bin/env bun

import chalk from "chalk";
import { search, CRMQError, VALID_STATES } from "../src";
import type { Doctor, SearchResult } from "../src";

/**
 * Parse command line arguments
 */
function parseArgs(): { state?: string; crm?: string; name?: string; json: boolean; help: boolean } {
  const args = process.argv.slice(2);
  const result = { state: undefined as string | undefined, crm: undefined as string | undefined, name: undefined as string | undefined, json: false, help: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "-s":
      case "--state":
        result.state = nextArg;
        i++;
        break;
      case "-c":
      case "--crm":
        result.crm = nextArg;
        i++;
        break;
      case "-n":
      case "--name":
        result.name = nextArg;
        i++;
        break;
      case "--json":
        result.json = true;
        break;
      case "-h":
      case "--help":
        result.help = true;
        break;
    }
  }

  return result;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
${chalk.bold("crmq")} - Query Brazilian doctors through the CFM portal API

${chalk.bold("USAGE:")}
  crmq -s <state> [options]

${chalk.bold("OPTIONS:")}
  -s, --state <UF>    Brazilian state code (required)
  -c, --crm <number>  CRM registration number
  -n, --name <name>   Doctor's name (partial match)
  --json              Output as JSON
  -h, --help          Show this help message

${chalk.bold("EXAMPLES:")}
  crmq -s RS -c 43327
  crmq --state SP --name "João Silva"
  crmq -s RS -c 43327 --json

${chalk.bold("VALID STATES:")}
  ${VALID_STATES.join(", ")}
`);
}

/**
 * Format status with color
 */
function formatStatus(status: string): string {
  switch (status) {
    case "regular":
      return chalk.green("Regular");
    case "irregular":
      return chalk.yellow("Irregular");
    case "suspended":
      return chalk.red("Suspended");
    case "canceled":
      return chalk.red("Canceled");
    default:
      return status;
  }
}

/**
 * Print results as table
 */
function printTable(result: SearchResult): void {
  if (result.doctors.length === 0) {
    console.log(chalk.yellow("No doctors found."));
    return;
  }

  // Calculate column widths
  const nameWidth = Math.max(4, ...result.doctors.map((d) => d.name.length));
  const crmWidth = Math.max(3, ...result.doctors.map((d) => d.crm.length));
  const specialtyWidth = Math.max(9, ...result.doctors.map((d) => (d.specialty ?? "-").length));

  // Header
  const header = [
    "Name".padEnd(nameWidth),
    "CRM".padEnd(crmWidth),
    "State",
    "Status".padEnd(10),
    "Specialty".padEnd(specialtyWidth),
  ].join(" │ ");

  const separator = [
    "─".repeat(nameWidth),
    "─".repeat(crmWidth),
    "─────",
    "─".repeat(10),
    "─".repeat(specialtyWidth),
  ].join("─┼─");

  console.log();
  console.log(chalk.bold(header));
  console.log(separator);

  // Rows
  for (const doctor of result.doctors) {
    const row = [
      doctor.name.padEnd(nameWidth),
      doctor.crm.padEnd(crmWidth),
      doctor.state.padEnd(5),
      formatStatus(doctor.status).padEnd(10 + 10), // Extra for color codes
      (doctor.specialty ?? "-").padEnd(specialtyWidth),
    ].join(" │ ");

    console.log(row);
  }

  console.log();
  console.log(chalk.dim(`Found ${result.total} doctor(s)`));
}

/**
 * Convert Doctor to JSON-serializable format
 */
function doctorToJson(doctor: Doctor): Record<string, unknown> {
  return {
    ...doctor,
    registrationDate: doctor.registrationDate.toISO(),
  };
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.state) {
    console.error(chalk.red("Error: State (-s, --state) is required."));
    console.error(chalk.dim("Run crmq --help for usage information."));
    process.exit(1);
  }

  try {
    const result = await search({
      state: args.state,
      crm: args.crm,
      name: args.name,
    });

    if (args.json) {
      const jsonResult = {
        doctors: result.doctors.map(doctorToJson),
        total: result.total,
      };
      console.log(JSON.stringify(jsonResult, null, 2));
    } else {
      printTable(result);
    }
  } catch (error) {
    if (error instanceof CRMQError) {
      console.error(chalk.red(`Error [${error.code}]: ${error.message}`));
      process.exit(1);
    }
    throw error;
  }
}

main();
