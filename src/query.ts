import { executeSearch } from "./client";
import { validateSearchOptions } from "./validation";
import type { SearchOptions, SearchResult } from "./types";

/**
 * Query builder for searching doctors
 */
export class CRMQuery {
  private _state: string | undefined;
  private _crm: string | undefined;
  private _name: string | undefined;

  /**
   * Set the state (UF) for the search - required
   */
  state(uf: string): this {
    this._state = uf.toUpperCase();
    return this;
  }

  /**
   * Set the CRM number for the search - optional
   */
  crm(number: string): this {
    this._crm = number;
    return this;
  }

  /**
   * Set the doctor name for the search - optional
   */
  name(name: string): this {
    this._name = name;
    return this;
  }

  /**
   * Execute the search with current parameters
   */
  async search(): Promise<SearchResult> {
    const options = this.buildOptions();
    const validated = validateSearchOptions(options);
    return executeSearch(validated);
  }

  /**
   * Reset the query builder to initial state
   */
  reset(): this {
    this._state = undefined;
    this._crm = undefined;
    this._name = undefined;
    return this;
  }

  /**
   * Build search options from current state
   */
  private buildOptions(): SearchOptions {
    return {
      state: this._state ?? "",
      crm: this._crm,
      name: this._name,
    };
  }
}

/**
 * Direct search function for one-off queries
 */
export async function search(options: SearchOptions): Promise<SearchResult> {
  const validated = validateSearchOptions(options);
  return executeSearch(validated);
}
